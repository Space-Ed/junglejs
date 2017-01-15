namespace Gentyl {

    export class ResolutionNode extends BaseNode {

        io:IO.ResolveIO;

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


            if(selection instanceof Array){
                var resolution  = {}

                for (var i = 0; i < selection.length; i++){
                    var k = selection[i];
                    resolution[k] = this.resolveNode(node[k], resolveArgs, true);
                }
                return resolution;
            }else{
                return this.resolveNode(node[selection], resolveArgs, true);
            }
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
                    return  cut ? null : node.resolve(resolveArgs)
                }else{
                    return cut ? {} : this.resolveObject(node, resolveArgs, selection)
                }
            }
            else{
                //we have a primative
                return cut ? null : node;
            }
        }

        resolve(resolveArgs){

            Object.freeze(resolveArgs)

            if (!this.prepared){
                this.prepare();
                //throw  Error("Node with state is not prepared, unable to resolve")
            }

            if (this.io.isShellBase && !this.io.specialGate){

                //resolve external
                var sInpHook = this.io.specialInput
                var sInpResult = sInpHook.tractor.call(this.ctx, resolveArgs);

                var sResult;
                if(sInpResult != IO.HALT && (sInpHook.eager || sInpResult !== undefined)){
                    this.io.specialGate = true;
                    sResult = this.resolve(sInpResult)
                    this.io.specialGate = false;
                    return sResult
                }else{
                    //the input has failed to trigger resolution our output hook
                    //will provide the return value on potentially undefined input
                    return this.io.specialOutput.tractor.call(this.ctx, sInpResult);
                }
            }else{

                var carried = this.form.carrier.call(this.ctx, resolveArgs)

                var resolvedNode
                if(this.crown != undefined){
                    //form the selection for this node
                    var selection =  this.form.selector.call(this.ctx, Object.keys(this.crown), resolveArgs);
                    //recurse on the contained node
                    resolvedNode = this.resolveNode(this.crown, carried, selection)
                }

                //modifies the resolved context and returns the processed result
                var result = this.form.resolver.call(this.ctx, resolvedNode,  resolveArgs, carried)

                return this.io.dispatchResult(result)
            }
        }

    }



}
