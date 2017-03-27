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


        private resolveDenizen(handle, args, denizen, reference){
            let mergekey = reference === undefined ? false : reference;

            if(denizen instanceof BaseCell && denizen !== undefined){
                let denizenArg = args === undefined ? undefined : args[reference];
                let resolved = denizen.resolve(denizenArg);
                handle.merge(resolved, mergekey);
            }else{
                handle.merge(denizen, mergekey);
            }
        }

        //main recursion
        private  resolveCell(handle:Util.Junction, node, carriedArgs, selection):any{
            //log("node to resolve: ", node)

            //cutting dictates that we select nothing and therefore will
            var cut = false;

            if(!selection){
                cut = true;
            }else if(selection === true && node instanceof Object){
                //select all
                selection = Object.keys(node);
            }
            //at this stage cut determines primitives are nullified and objects empty
            const projectedCrown = this.crown; //TODO: projection onto selected keys;
            const core = this;

            //in here we have time to scan all Denizens and they will merge into the handle.
            let splitf = core.resolveDenizen.bind(core, handle, carriedArgs)

            Util.typeCaseSplitF(splitf)(projectedCrown);
        }

        innerResolve(resolveArgs){
            this.resolveCache = {
                args:resolveArgs,
                carried:null,
                crowned:null,
                selection:null,
                reduced:null
            }

            //let [begin, raise] = this.junction.hold();

            this.junction
                .then(this.resolveCarryThen.bind(this),false)
                .then(this.resolveCrownThen.bind(this),false)
                .then(this.resolveReduceThen.bind(this),false)
                .then(this.resolveCompleteThen.bind(this),false)

            //begin();

            return this.junction.realize();

            //var selection = this.form.selector.call(this.ctx.exposed, Object.keys(this.crown), this.resolveCache.resolveArgs);
        }

        resolveCarryThen(results, handle){
            //console.log("carry results:", results)
            this.ctx.exposed.handle = handle;
            return this.form.carrier.call(this.ctx.exposed, this.resolveCache.args);
        }

        resolveCrownThen(results, handle){
            this.resolveCache.carried = results;
            return this.resolveCell(handle, this.crown,  this.resolveCache.carried, true);
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
