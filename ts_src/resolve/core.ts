namespace Gentyl {

    function cleanCrown(crown){
        function clean(gem){
            if(gem instanceof IO.GatedPort){
                if(!gem.allHome()){
                    throw Error("Crown still contains unreturned ")
                }
                return gem.deposit;
            }else{
                return gem;
            }
        }

        return Util.typeCaseSplitF(clean)(crown)

    }

    export class ResolutionNode extends BaseNode {

        resolveCache:{
            stage:string,
            resolveArgs:any,
            carried:any,
            selection:any,
            resolvedCrown:any,
            resolvedValue:any
        };

        io:IO.ResolveIO;
        form:GForm;

        protected constructForm(){
            return new GForm(this)
        }

        protected constructIO(iospec){
            return new IO.ResolveIO(this, iospec)
        }

        protected constructCore(crown, form){
            return new ResolutionNode(crown, form)
        }

        private  resolveArray(array:any[],resolveArgs, selection):any[]{
            //TODO:selector must produce index or array thereof

            if(selection instanceof Array){
                var resolution = []
                for (var i = 0; i < selection.length; i++){
                    resolution[i] = this.resolveNode(array[selection[i]], resolveArgs, true)
                }
                return resolution
            }else {
                return this.resolveNode(array[selection], resolveArgs, true)
            }
        }

        private resolveObject(node, resolveArgs, selection):any{
            let resolution
            if(selection instanceof Array){
                resolution  = {}

                for (var i = 0; i < selection.length; i++){
                    var k = selection[i];
                    resolution[k] = this.resolveNode(node[k], resolveArgs, true);
                }
            }else{
                resolution = this.resolveNode(node[selection], resolveArgs, true);
            }



            return resolution;
        }

        //main recursion
        private  resolveNode(node, resolveArgs, selection):any{
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

            if (node instanceof Array){
                return cut ? [] : this.resolveArray(node, resolveArgs, selection)
            }
            else if (typeof(node) === "object"){
                if(node instanceof BaseNode){
                    if(!cut){
                        let resolved = node.resolve(resolveArgs);

                        if(resolved instanceof IO.GatedPort){
                            if(!resolved.returned){
                                this.deplexer.addTributary(resolved);
                            }
                            return this.deplexer;
                        }

                        return resolved
                    }

                }else{
                    return cut ? {} : this.resolveObject(node, resolveArgs, selection)
                }
            }
            else{
                //we have a primative
                return cut ? null : node;
            }
        }

        /*
            the resolve compete callback, controls passing between stages;
            must deposit the information passed to the next stage;
        */
        proceed(received){

            //console.log('proceed reached stage '+ this.resolveCache.stage +' with: ', received)

            switch(this.resolveCache.stage){
                case 'resolve-carry': {
                    this.resolveCache.carried = received;
                    this.resolveSelect(); break

                }case 'resolve-select':{
                    this.resolveCache.selection = received;
                    this.resolveCrown(); break

                }case 'resolve-crown':{
                    this.resolveCache.resolvedCrown = cleanCrown(this.resolveCache.resolvedCrown);
                    this.resolveReturn();break

                }case 'resolve-return':{
                    this.resolveCache.resolvedValue = received;
                    this.resolveComplete();break
                }
            }
        }

        resolve(resolveArgs){

            Object.freeze(resolveArgs)

            //
            if(!this.prepared){
                var pr = this.prepare();

                //prepare does not return;
                if(pr instanceof IO.GatedPort){
                    return pr;
                }
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

                // if(this.engaged){
                //     //TODO: what to do when the node is busy getting prepared.
                //     return this.deplexer;
                // }else{
                //     this.engaged = true;
                // }

                this.resolveCache = {
                    stage:'resolve-carry',
                    resolveArgs:resolveArgs,
                    carried:undefined,
                    selection:undefined,
                    resolvedCrown:undefined,
                    resolvedValue:undefined
                }
                //assuming deplex is free
                this.deplexer.reset("resolve", this.proceed);
                this.engaged = true;

                var carried = this.form.carrier.call(this.ctx.exposed, resolveArgs);

                if(this.deplexer.allHome()){
                    this.resolveCache.carried = carried;
                    return this.resolveSelect();
                }else{
                    return this.deplexer //pass async handle out to be called when this resolve is done;
                }
            }
        }

        resolveSelect(){
            this.resolveCache.stage = 'resolve-select';

            var resolvedNode
            if(this.crown != undefined){
                var selection = this.form.selector.call(this.ctx.exposed, Object.keys(this.crown), this.resolveCache.resolveArgs);

                if(this.deplexer.allHome()){
                    this.resolveCache.selection = selection
                    return this.resolveCrown();
                }else{
                    return this.deplexer;
                }
            }else{
                return this.resolveReturn();
            }



        }

        resolveCrown(){
            this.resolveCache.stage = 'resolve-crown';
            var resolvedCrown = this.resolveNode(this.crown, this.resolveCache.carried, this.resolveCache.selection)

            this.resolveCache.resolvedCrown = resolvedCrown;
            if(this.deplexer.allHome()){
                this.resolveCache.resolvedCrown = cleanCrown(resolvedCrown);
                return this.resolveReturn();
            }else{
                return this.deplexer //continue on done;
            }
        }

        resolveReturn(){
            this.resolveCache.stage = 'resolve-return';
            //modifies the resolved context and returns the processed result
            var result = this.form.resolver.call(this.ctx.exposed, this.resolveCache.resolvedCrown,  this.resolveCache.resolveArgs, this.resolveCache.carried);

            if(this.deplexer.allHome()){
                this.resolveCache.resolvedValue = result;
                return this.resolveComplete();
            }else{
                return this.deplexer //continue on done;
            }
        }

        resolveComplete(){
            this.engaged = false;
            var dispached = this.io.dispatchResult(this.resolveCache.resolvedValue);
            this.deplexer.deposit = dispached;
            return dispached;
        }
    }



}
