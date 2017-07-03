import {typeCaseSplitR} from './typesplit'

enum JResultNatures {
    Single, Keyed, Indexed, Appended, Uninferred
}

const WAITING = "WAIT";

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

export class Junction {

    private resultNature:JResultNatures;

    awaits:any;
    index:number;

    silentAwaits:boolean[];
    silentIndex:number;

    residue:any;

    leashed:any;
    error:{
        message:string;
        key:string|number;
    }

    catchCallback;
    thenCallback;

    future:Junction;

    fried:boolean;
    blocked:boolean;
    cleared:boolean;

    thenkey:boolean|string|number;

    constructor(){
        this.leashed = [];
        this.silentIndex = 0;
        this.silentAwaits = [];
        this.resultNature = JResultNatures.Uninferred;

        this.blocked = false;
        this.cleared = false;
        this.fried = false;
    }

    //phase complete;
    private proceedThen(){
        this.cleared = true;

        if (this.thenCallback !== undefined){
            let propagate, handle;

            handle = new Junction();
            let future = this.future;

           //console.log('residue planted: ', this.residue)
            propagate = this.thenCallback(this.awaits,  handle); //this.residue,

            if(handle.isClean()){
                //handle unused so keep the return value;
                future.unleash(propagate);
            }else {
                //lose the return from the callback, could be immediate, could be later;
               //console.log('proceeding from a tampered handle ')
                //
                // let handleFrontier = handle.frontier()
                // if(handleFrontier.isTampered()){
                //     handle.then(function(result, residue){
               //console.log('tampered handle result:', result, "residue",  residue)
                //         future.unleash(result);
                //     });
                // }else{
                //     handle.then(function(result, residue){
               //console.log('Idle handle result:', result, "residue", residue)
                //         future.unleash(residue);
                //     });
                // }

                handle.then(function(result, handle){
                    future.unleash(result);
                });
            }

        }else{
            //cascade residue
            this.future.unleash(this.awaits);

        }

    }

    private unleash(propagated){

        let [release , raise ] = this._hold(this.thenkey);
        //this.residue = propagated;

        this.blocked = false;

        //the last act may proceed
        for(let i = 0; i < this.leashed.length; i++){
            this.leashed[i]();
        }

        delete this.leashed;

        release(propagated);

        //proceed when
       //console.log('check from unleash')
        // if(this.isReady()){
        //     this.proceedThen();
        // }
    }

    private proceedCatch(error){
        if( this.catchCallback !== undefined){
            this.catchCallback(error);
        }else if ( this.future !== undefined){
            this.future.proceedCatch(error);
        }else{
            throw new Error(`Error raised from hold, arriving from ${error.key} with message ${error.message}`);
        }
    }

    /*
        the first uncleared junction beyond this
    */
    private successor():Junction{
        if(this.cleared || !this.hasFuture()){
            return this;
        }else{
            return this.future.successor();
        }
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
            return this.awaits;
        }else{
            if(this.hasFuture()){
                return this.future.realize();
            }else{
                return this;
            }
        }
    }

    private isClean(){
        return !this.hasFuture() && !this.isTampered() && this.isPresent();
    }

    public isIdle(){
        return this.allDone() && this.isPresent()
    }

    private isReady(){
        return this.allDone() && this.isPresent() && this.hasFuture() && !this.fried;
    }

    private isTampered(){
        return !(this.silentAwaits.length <= 1 && this.resultNature === JResultNatures.Uninferred);
    }

    private isPresent(){
        return !(this.blocked || this.cleared);
    }

    private hasFuture(){
        return this.future != undefined;
    }

    private allDone(){
        let awaitingAnySilent = false;
        this.silentAwaits.forEach((swaiting) => {awaitingAnySilent = swaiting || awaitingAnySilent});

        let awaitingAny;
        if( this.resultNature === JResultNatures.Single ){
            awaitingAny = this.awaits === WAITING;
        } else {
            awaitingAny = typeCaseSplitR(
                function(thing, key){
                    return thing === WAITING
                })(this.awaits, false, function(a,b,k){return a||b});
        }

       //console.log(`allDone: cleared ${this.cleared}, awaitingAny ${awaitingAny}, $awaitSilent ${awaitingAnySilent}, awaits:`, this.awaits, " silent; ", this.silentAwaits)

        return this.cleared || (!awaitingAny && !awaitingAnySilent);

    }


    public hold(returnkey?):((result?:any) => any)[]{
        return this.frontier()._hold(returnkey);
    }

    public _hold(returnkey?):((result?:any) => any)[]{
        let accessor, silent = false // sets this.

        if (returnkey === true){//APPENDED
            if(this.resultNature === JResultNatures.Uninferred){
                this.resultNature = JResultNatures.Appended; this.awaits = [];  this.index = 0;
            }
            if(this.resultNature !== JResultNatures.Appended){throw new Error("Cannot combine appended result with other")};
            accessor = this.index;
            this.awaits[accessor] = WAITING;
            this.index++;
           //console.log(`index ${this.index}`)
        }else if(returnkey === false){ //SINGLE
            if(this.resultNature === JResultNatures.Uninferred){
                this.resultNature = JResultNatures.Single;
            }
            if(this.awaits !== undefined){throw new Error("Single result feed from : hold(false) is unable to recieve any more results")}
            this.awaits = WAITING;
        }else if(typeof(returnkey) === 'string'){ // KEYED
            if(this.resultNature === JResultNatures.Uninferred){
                this.resultNature = JResultNatures.Keyed; this.awaits = {};
            }
            if(this.resultNature !== JResultNatures.Keyed){throw new Error("cannot use hold(string) when it is used for something else")}
            accessor = returnkey;
            this.awaits[accessor] = WAITING;
        }else if(typeof(returnkey) === 'number'){ ///INDEXED
            if(this.resultNature === JResultNatures.Uninferred){
                this.resultNature = JResultNatures.Indexed; this.awaits = [];
            }
            if(this.resultNature !== JResultNatures.Indexed){throw new Error("cannot use hold(number) when it is used for something else")}
            accessor = returnkey;
            this.awaits[accessor] = WAITING;
        }else if(returnkey === undefined){ // SILENT
            accessor = this.silentIndex;
            this.silentAwaits[this.silentIndex++] = true;
            silent = true;
        }else{
            throw new Error("Invalid hold argument, must be string, number, boolean or undefined")
        }

        return [
            ((res)=>{
                if((accessor !== undefined) && !silent){
                    this.awaits[accessor] = res;
                }else if((accessor !== undefined) && silent){
                    this.silentAwaits[accessor] = false;
                }else if(accessor === undefined){
                   //console.log('Set single await to ', res, ' is cleared ? ', this.cleared)
                    this.awaits = res;
                }

               //console.log('check from merge')
                if(this.isReady()){
                    this.proceedThen(); //proceed from awaited
                }
            }),
            ((err)=>{
                this.fried = true;
                this.error = {
                    message:err, key:accessor
                };

                //Default value, sideways reports, thrown error
                if (this.fried && this.hasFuture()){
                    this.proceedCatch(this.error);
                }
            })
        ]
    }

    await(act:(done:(returned:any)=>Junction, raise:(message:string)=>void)=>any, label?):Junction {
        let frontier = this.frontier()

        let [done, raise] = frontier.hold(label);

        if(frontier.blocked){
            frontier.leashed.push(act.bind(null, done, raise));
        }else{
            act(done, raise);
        }

        return frontier;
    }

    merge(upstream:any, holdstyle?){
        let frontier = this.frontier();

        if(upstream instanceof Junction){
            return frontier.await(function(done, raise){
                upstream.then(done);
                upstream.catch(raise);
            }, holdstyle);
        }else{
            frontier.hold(holdstyle)[0](upstream);
            return frontier;
        }
    }

    then(callback:(results:any, residue:any, handle:Junction)=>void, thenkey?):Junction{
        let frontier = this.frontier();

        frontier.future = new Junction();
        frontier.future.thenkey = thenkey;
        frontier.future.blocked = true;

        frontier.thenCallback = callback;

        if(frontier.isReady()){
            frontier.proceedThen();
        }

        return frontier.future;
    }

    catch(callback:Function):Junction{
        let frontier = this.frontier();

        frontier.future = new Junction();
        frontier.future.blocked = true;
        frontier.catchCallback = callback;

        if (frontier.fried && frontier.hasFuture()){
            frontier.proceedCatch(frontier.error);
        }

        return frontier.future;
    }

}
