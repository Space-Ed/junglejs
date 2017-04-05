namespace Jungle {


    export class ResolutionCell extends BaseCell {

        kind:string = "Resolution";

        io:IO.ResolveIO;
        form:GForm;
        resolveCache:{
            args:any,
            carried:any,
            selection:any,
            crowned:any,
            reduced:any
        }

        protected constructForm(){
            return new GForm(this)
        }

        protected constructIO(iospec){
            return new IO.ResolveIO(this, iospec)
        }

        protected constructCore(crown, form){
            return new ResolutionCell(crown, form)
        }


        private resolveDenizen(deref, handle, args, denizen, reference){
            console.log(`resolving subject ${reference} : ${denizen}`);

            let mergekey = reference === undefined ? false : reference;

            if(denizen !== undefined && denizen instanceof BaseCell){

                let denizenArg;
                if(deref){
                    denizenArg = args[reference];
                }else{
                    denizenArg = args;
                }

                let resolved = denizen.resolve(denizenArg);

                console.log('resolved', resolved)
                handle.merge(resolved, mergekey);
            }else{
                handle.merge(denizen, mergekey);
            }
        }

        //main recursion
        private  resolveCell(handle:Util.Junction, node, carriedArgs):any{

            let projectedCrown, deref;

            //if the carried arg does not have the key
            if(carriedArgs instanceof Object && this.crown instanceof Object){
                let carriedKeys;
                carriedKeys = Object.keys(carriedArgs);

                //if there are any extraneous keys we will not allow selection.
                if(Util.isSubset(carriedKeys, Object.keys(this.crown))){ //then we can use all the carried keys to select
                    projectedCrown = Util.projectObject(this.crown, carriedKeys);
                    deref = true;
                }
                // else if(Util.isSubset(Object.keys(this.crown), carriedKeys)){ //we can use carried keys to dereference
                //     projectedCrown = this.crown;
                //     deref = true;
                // }
                else{
                    projectedCrown = this.crown;
                    deref = false;
                }
            }else{
                projectedCrown = this.crown;
                deref = false;
            }

            //in here we have time to scan all Denizens and they will merge into the handle.
            let splitf = this.resolveDenizen.bind(this, deref, handle, carriedArgs)

            //the result is not used
            Util.typeCaseSplitF(splitf)(projectedCrown);
        }

        resolve(resolveArgs){

            Object.freeze(resolveArgs)

            // if the generator is in use it is dangerous to layer on the junction as an external user would be unsure of what result they are getting
            // if(!this.junction.isIdle()){
            //     throw new Error("Unable to resolve, the generator is in use")
            // }


            /*
                when a node is not prepared before resolve it should be done
            */
            if(!this.prepared){
                var pr = this.prepare();
            }

            if (this.io.isShellBase && !this.io.specialGate){

                //resolve external
                var sInpHook = this.io.specialInput
                var sInpResult = sInpHook.tractor.call(this.ctx.exposed, resolveArgs);

                var sResult;
                if(sInpResult != IO.HALT && (sInpHook.eager || sInpResult !== undefined)){
                    this.io.specialGate = true;
                    sResult = this.resolve(sInpResult);
                    this.io.specialGate = false;
                    return sResult;
                }else{
                    //the input has failed to trigger resolution our output hook
                    //will provide the return value on potentially undefined input
                    return this.io.specialOutput.tractor.call(this.ctx.exposed, sInpResult);
                }
            }else{

                this.resolveCache = {
                    args:resolveArgs,
                    carried:null,
                    crowned:null,
                    selection:null,
                    reduced:null
                }

                this.junction = this.junction
                    .then(this.resolveCarryThen.bind(this),false)
                    .then(this.resolveCrownThen.bind(this),false)
                    .then(this.resolveReduceThen.bind(this),false)
                    .then(this.resolveCompleteThen.bind(this),false)

                return this.junction.realize();

            }
        }

        resolveCarryThen(results, handle){
            //console.log("carry results:", results)
            this.ctx.exposed.handle = handle;
            return this.form.carrier.call(this.ctx.exposed, this.resolveCache.args);
        }

        resolveCrownThen(results, handle){
            this.resolveCache.carried = results;
            return this.resolveCell(handle, this.crown,  this.resolveCache.carried);
        }

        resolveReduceThen(results, handle){
            this.resolveCache.crowned = results;
            this.ctx.exposed.handle = handle;
            return this.form.resolver.call(this.ctx.exposed,  this.resolveCache.crowned,   this.resolveCache.args,  this.resolveCache.carried);
        }

        resolveCompleteThen(results, handle){
            this.resolveCache.reduced = results;
            var dispached = this.io.dispatchResult(this.resolveCache.reduced);
            return dispached;
        }
    }

}
