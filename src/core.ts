/// <reference path="./util.ts"/>
/// <reference path="./context.ts"/>

namespace Gentyl {

    export class ResolutionNode {
        ctx:ResolutionContext;
        node:any;

        parent:ResolutionNode;
        depth:number;

        root:ResolutionNode;
        prepared:boolean;
        functional:boolean;


        constructor(private resolver:Function, components:Object, private carrier=(x)=>{return x}, mode=''){
            //scan for all underscores splitting context node

            //Initialised properties of state
            var context = {}
            var node;

            //construct the node of array object or primative type
            if(components instanceof Array){
                node = [];
                node.lenth= components.length;
                for (var i = 0; i < components.length; i++){
                    var component = components[i];
                    var c = this.prepareComponent(component);
                    node[i] = c
                }

            }else if(components instanceof Object){
                node = {}

                for (var k in components){
                    var component = components[k];
                    //convert all objects into resolution nodes, for consistent depth referencing.
                    var c = this.prepareComponent(component);

                    if(k[0] == "_"){
                        this.functional = false;
                        context[k.slice(1)] = c;
                    } else {
                        node[k] = c;
                    }
                }
            }else {
                node = components;
            }

            this.node = node;
            this.ctx = new ResolutionContext(this, context, mode);


        }

        /**
         * setup the state tree, recursively preparing the contexts
         */
        public prepare(){
            this.prepared = true;

            if(!this.functional){
                this.ctx.prepare();
            }

            if(this.node instanceof Array){
                for (let i = 0; i < this.node.length; i++){
                    let val = this.node[i];
                    if(val instanceof ResolutionNode){
                        val.prepare();
                    }
                }

            }else if (this.node instanceof Object){
                for (let k in this.node){
                    let val = this.node[k];
                    if(val instanceof ResolutionNode){
                        val.prepare();
                    }
                }

            }else{
                if(this.node instanceof ResolutionNode){
                    this.node.prepare();
                }
            }
        }

        private prepareComponent(component):any{
            var c
            if (component instanceof ResolutionNode){
                c = component
                c.setParent(this);
            }else if (component instanceof Object){
                c = new BlankNode(component)
                c.setParent(this);
            }else {
                c = component
            }

            return c;
        }

        public getParent(toDepth = 1):ResolutionNode{
            if (toDepth  == 1 ){
                return this.parent
            }else if (this.parent == undefined){
                throw new Error("requested parent depth too great")
            }else{
                return this.parent.getParent(toDepth - 1)
            }
        }

        public getRoot():ResolutionNode{
            return this.getParent(this.depth);
        }

        private setParent(parentNode:ResolutionNode){
            this.parent = parentNode;
            this.depth = parentNode.depth + 1;
        }

        private  resolveArray(array:any[],resolveArgs):any[]{
            var resolution = []

            for (var i = 0; i < array.length; i++){
                resolution[i] = this.resolveNode( array[i],resolveArgs)
            }

            return resolution
        }

        private resolveObject(node, resolveArgs):any{
            //log("Object to resolve: ", node)
            var resolution  = {}

            for (var k in node){
                var val = node[k]
                //we have an ordinary item
                resolution[k] = Util.melder(resolution[k], this.resolveNode(val, resolveArgs))
            }
            return resolution
        }


        //main recursion
        private  resolveNode(node, resolveArgs):any{
            //log("node to resolve: ", node)
            var resolution

            if (node == undefined){
                return null
            }
            else if (node instanceof Array){
                resolution = this.resolveArray(node, resolveArgs)
            }
            else if (typeof(node) == "object"){
                if(node instanceof ResolutionNode){
                    resolution = node.resolve(resolveArgs)
                }else{
                    //now all nodes are converted into G nodes
                    resolution = this.resolveObject(node, resolveArgs)
                }
            }
            else{
                //we have a string or number
                resolution = node
            }
            return resolution
        }


        private resolveUnderscore(resolver:ResolutionNode, resolveArgs){
            //now this is the parent context

            var result = resolver.resolve(resolveArgs)

            return result

        }

        resolve(resolveArgs){

            if (!this.prepared && !this.functional){
                throw  Error("Node with state is not prepared, unable to resolve")
            }

            //recurse on the contained node
            var resolvedNode = this.resolveNode(this.node, resolveArgs)

            //modifies the resolved context and returns the processed result
            var result = this.resolver.call(this.ctx, resolvedNode, this.carrier(resolveArgs))


            return result
        }
    }

    export class BlankNode extends ResolutionNode {

        constructor(components){
            super(function(x){return x}, components)
        }

    }


    export function g(components:Object, resolver=(x, a)=>{return x}, carrier=(x)=>{return x}, mode=''){
        return new ResolutionNode(resolver, components, carrier, mode)
    }
}
