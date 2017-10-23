import {typeCaseSplitR} from '../typesplit'
import * as Modes from './modes'

enum JResultNatures {
    Single, Keyed, Indexed, Appended, Uninferred
}

const WAITING = Symbol("WAITING");
const CACHE_TYPES:any= {
    "first"  : Modes.FirstMode,
    "last"   : Modes.LastMode,
    "single" : Modes.SingleMode,
    "race"   : Modes.RaceMode,
    "object" : Modes.ObjectMode,
    // "array" Modes. :ArrayMode,
    "append" : Modes.AppendMode,
    "silent" : Modes.SilentMode
}

export function dezalgo(junction, fallback){
    if(junction instanceof Junction){
        let zalgo = junction.realize()

        if(zalgo instanceof Junction){
            //awaiting
            return fallback
        }else{
            //fulfilled
            return zalgo
        }
    }else{
        return junction
    }

}

export type JunctionModes = "first"|"last"|"race"|"object"|"array"|"append"|"single"|"silent"

export class Junction {

    private cachetype:JunctionModes;
    private cache:Modes.CacheMode;
    private leashed:any;
    private thenargs:any[]

    error:{
        message:string;
        key:string|number;
    }

    catchCallback;
    thenCallback;

    future:Junction;

    fried:boolean;
    blocked:boolean;
    proceeded:boolean;

    constructor(){
        this.thenargs = [];
        this.leashed = [];
        this.blocked = false;
        this.proceeded = false;
        this.fried = false;

        this.cache = new Modes.LastMode()
    }

    private isClean(){
        return !this.hasFuture() && !this.isTampered() && this.isPresent();
    }

    public isIdle(){
        return this.allDone() && this.isPresent()
    }

    private isReady(){
        return this.allDone() && this.isPresent() && this.hasFuture() && !this.fried
    }

    private isTampered(){
        return this.cache.isBusy() || this.hasFuture()
    }

    private isPresent(){
        return !(this.blocked || this.proceeded);
    }

    private hasFuture(){
        return this.future != undefined;
    }

    private allDone(){
        return (this.proceeded || this.cache.isDone());
    }

    private frontier():Junction{
        if(this.future){
            return this.future.frontier();
        }else{
            return this
        }
    }

    public realize():any{

        if(this.isIdle()){
            return this.cache.getCached();
        }else{
            if(this.hasFuture()){
                return this.future.realize();
            }else{
                return this;
            }
        }
    }

    public mode(mode:JunctionModes, ...modeargs){
         this.frontier()._mode(mode, modeargs);
         return this
    }

    private _mode(mode:JunctionModes, ...modeargs){

        if(mode in CACHE_TYPES){
            this.cachetype = mode;
            this.cache = new CACHE_TYPES[mode](...modeargs)
        }else{
            new Error('Invalid hold argument, must be one of "first"|"last"|"race"|"object"|"array"|"append"|"single"')
        }

    }

    await(act:(done:(returned:any)=>Junction, raise:(message:string)=>void)=>any, ...awaitargs):Junction {
        let frontier = this.frontier()

        let [done, raise] = frontier.hold(...awaitargs);

        if(frontier.blocked){
            frontier.leashed.push(act.bind(null, done, raise));
        }else{
            act(done, raise);
        }

        return frontier;
    }

    merge(upstream:any, ...mergeargs){
        let frontier = this.frontier();

        if(upstream instanceof Junction){
            return frontier.await(function(done, raise){
                upstream.then(done);
                upstream.catch(raise);
            }, ...mergeargs);
        }else{
            frontier.hold(...mergeargs)[0](upstream);
            return frontier;
        }
    }

    public hold(...holdargs):((result?:any) => any)[]{
        return this.frontier()._hold(...holdargs);
    }

    private _hold(...holdargs):((result?:any) => any)[]{
        let ticket = this.cache.depart(...holdargs)
        return [
            ((res)=>{
                this.cache.backOK(ticket, res, ...holdargs)

                if(this.isReady()){
                    this.proceedThen();
                }
            }),
            ((err)=>{
                let error = this.cache.backERR(ticket, {
                    message:err,
                    key:ticket
                });

                this.raise(error)
            })
        ]
    }

    raise(error){
        this.fried = true;
        this.error = error;
        //Default value, sideways reports, thrown error
        if (this.hasFuture()) {
            this.proceedCatch(this.error);
        }
    }

    catch(callback:Function):Junction{
        let frontier = this.frontier();

        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.catchCallback = callback;

        if (frontier.fried ){
            frontier.raise(frontier.error)
        }

        return frontier.future;

    }
    /**
     * find the next catch callback
     */
    private proceedCatch(error){
        if( this.catchCallback !== undefined){
            this.catchCallback(error);
        }else if ( this.future !== undefined){
            this.future.proceedCatch(error);
        }else{
            throw new Error(`Error raised from hold, arriving from ${error.key} with message ${error.message}`);
        }
    }

    then(callback:(results:any)=>any, ...thenargs):Junction{

        let frontier = this.frontier();

        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.future._mode(this.cachetype);
        frontier.future.thenargs = thenargs;

        //error propogation
        frontier.future.fried = frontier.fried;
        frontier.future.error = frontier.error;

        frontier.thenCallback = callback;

        if(frontier.isReady()){
            frontier.proceedThen();
        }

        return frontier.future;
    }

    //phase complete;
    private proceedThen(){

        this.proceeded = true;

        let cached = this.cache.getCached()
        
        if (this.thenCallback !== undefined){
            let future = this.future;
            let propagate = this.thenCallback(cached);

            if(propagate instanceof Junction){
                propagate.then(function(result){
                    future.unleash(result);
                })
            }else{
                future.unleash(propagate);
            }
        }else{
            //cascade residue
            this.future.unleash(cached);

        }

    }

    /**
     * Start the next parallel response phase, calling all await functions for the phase
     */
    private unleash(propagated){
        //a temporary hold that keeps the unleashed from proceeding prematurely
        let [done, raise] = this._hold(...this.thenargs)

        this.blocked = false;

        for(let i = 0; i < this.leashed.length; i++){
            this.leashed[i]();
        }

        delete this.leashed;

        done(propagated)
    }
}
