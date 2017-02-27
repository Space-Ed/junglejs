namespace Jungle {
    export namespace Util {
        export class Junction {

            awaits  = {};
            results = [];
            index   = 0;
            leashed = {};

            catchCallback;
            thenCallback;

            future:Junction;
            blocked:boolean;
            propagated:any;

            constructor(){
                this.awaits  = {};
                this.results = [];
                this.index   = 0;
                this.blocked = false;
            }

            //phase complete;
            private proceedThen(){
                if (!this.blocked){
                    let propagate = this.thenCallback !== undefined
                        ? this.thenCallback(this.results, this.propagated)
                        : this.propagated;

                    //if then flows into another then
                    if(this.future){
                        this.future.unleash(propagate);
                    }
                }
            }

            private proceedCatch(error){
                throw new Error(`Error caught in junction, arriving from...`)
            }

            private fastForward():Junction{
                if(this.future){
                    return this.future.fastForward();
                }else{
                    return this
                }
            }

            private allDone(){
                return Object.keys(this.awaits).length === 0;
            }

            private draw(returnkey):((returned:any)=>Junction)[]{
                this.awaits[returnkey] = returnkey;

                return [(function(res){
                    this.results[returnkey] = res;
                    delete this.awaits[returnkey];
                    if(this.allDone()){
                        this.proceedThen(); //proceed from awaited
                    }
                    return this;
                }).bind(this), (function(err){
                    //Default value, sideways reports, thrown error
                    this.proceedCatch();

                    return this;
                }).bind(this)]
            }

            private unleash(pastValue){
                this.propagated = pastValue;
                this.blocked = false;

                for(let key in this.leashed){
                    this.leashed[key]();
                }

                delete this.leashed;
            }

            await(act:(done:(returned:any)=>Junction, raise:(message:string)=>void)=>any, label?):Junction {
                if(this.future){
                    return this.future.await(act, label);
                }else{
                    let key = label || this.index++;
                    let [doner, raiser] = this.draw(key);

                    if(this.blocked){
                        this.leashed[key] = act.bind(null, doner, raiser);
                    }else{
                        act(doner, raiser);
                    }

                    return this;
                }

            }

            merge(upstream:Junction, label?){
                return this.await(function(done, raise){
                    upstream.then(done);
                    upstream.catch(raise);
                }, label)
            }

            then(callback:(results:any)=>void):Junction{
                if(this.future){
                    return this.future.then(callback);
                }else{
                    this.future = new Junction();
                    this.future.blocked = true;

                    this.thenCallback = callback;

                    if(this.allDone()){
                        this.proceedThen(); //proceed from
                    }

                    return this.future;

                }


            }

            catch(callback:Function):Junction{
                this.catchCallback = callback;
                return this;
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
