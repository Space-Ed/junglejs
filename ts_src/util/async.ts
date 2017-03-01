namespace Jungle {
    export namespace Util {
        export class Junction {

            awaits  = {};
            results = [];
            index   = 0;
            leashed = {};
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
            residue:any;
            feedfree:boolean

            constructor(){
                this.awaits  = {};
                this.results = [];
                this.index   = 0;
                this.blocked = false;
                this.cleared = false;
                this.feedfree = true;
                this.fried = false;
            }

            //phase complete;
            private proceedThen(){
                this.cleared = true;

                let propagate
                if (this.thenCallback !== undefined){
                    if(this.residue !== undefined) {this.results['residue'] = this.residue}
                    propagate = this.thenCallback(this.results);
                }else{
                    propagate = this.residue;
                }

                //removal of cleared awaits
                this.awaits = undefined;

                //if then flows into another then
                this.future.unleash(propagate);

            }

            private feedPropagated(released){
                this.residue = released;
                this.feedfree = true;

                if(this.isReady()){
                    this.proceedThen();
                }
            }

            private unleash(propagated){

                if( propagated instanceof Junction){
                    this.feedfree = false;
                    propagated.then(this.feedPropagated.bind(this))
                }else{
                    this.residue = propagated;
                }

                this.blocked = false;

                //the last act may proceed
                for(let key in this.leashed){
                    this.leashed[key]();
                }

                delete this.leashed;

                //proceed when
                if(this.isReady()){
                    this.proceedThen();
                }
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

            private frontier():Junction{
                if(this.future){
                    return this.future.frontier();
                }else{
                    return this
                }
            }

            private isReady(){
                return this.allDone() && this.isPresent() && this.hasFuture() && this.feedfree && !this.fried;
            }

            private isPresent(){
                return !(this.blocked || this.cleared);
            }

            private hasFuture(){
                return this.future != undefined;
            }

            private allDone(){
                return Object.keys(this.awaits).length === 0;
            }

            public hold(returnkey):((result:any) => any)[]{
                if(returnkey === 'residue'){
                    throw new Error("Unable to use keyword 'residue' for a hold key")
                }

                let frontier = this.frontier();

                let accessor = returnkey || frontier.index++;
                frontier.awaits[accessor] = accessor;

                return [
                    (function(res){
                        frontier.results[accessor] = res;
                        delete frontier.awaits[accessor];

                        if(frontier.isReady()){
                            frontier.proceedThen(); //proceed from awaited
                        }
                    }),
                    (function(err){
                        frontier.fried = true;
                        frontier.error = {
                            message:err, key:accessor
                        };
                        delete frontier.awaits[accessor];
                        //Default value, sideways reports, thrown error
                        if (frontier.fried && frontier.hasFuture()){
                            frontier.proceedCatch(frontier.error);
                        }
                    })
                ]
            }

            await(act:(done:(returned:any)=>Junction, raise:(message:string)=>void)=>any, label?):Junction {
                let frontier = this.frontier()

                let [done, raise] = frontier.hold(label);

                if(frontier.blocked){
                    frontier.leashed[label] = act.bind(null, done, raise);
                }else{
                    act(done, raise);
                }

                return frontier;
            }

            merge(upstream:Junction, label?){
                return this.await(function(done, raise){
                    upstream.then(done);
                    upstream.catch(raise);
                }, label)
            }

            then(callback:(results:any, residue)=>void):Junction{
                let frontier = this.frontier();

                frontier.future = new Junction();
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

        export class Gate{
            private locks:boolean[];
            private locki:number;
            private data:any[];

            constructor(public callback?, public context?){
                this.locks = [];
                this.locki = 0;
                this.data = [];
            }

            lock():(arg) => void {
                this.locks[this.locki] = true;

                return (function(locki, arg){

                    if(arg != undefined){
                        this.data = arg;
                    }

                    this.locks[locki] = false;
                    if(this.allUnlocked()){
                        this.callback.call(this.context, this.data);
                    }
                }).bind(this, this.locki++)
            }

            reset(){
                this.locks = [];
                this.locki = 0;
            }

            isUntouched(){
                return this.locki === 0;
            }

            allUnlocked():boolean{
                return this.locks.filter(function(x){return x}).length === 0;
            }
        }



    }
}
