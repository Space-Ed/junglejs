/// <reference path="./util.ts"/>
/// <reference path="./context.ts"/>

var signals = <SignalWrapper>require('signals')

namespace Gentyl {

    export interface Form {
        f?:(obj, args?)=>any;
        c?:(args?)=>any;
        s?:(keys, arg?)=>any;
        p?:(arg)=>void;
        m?:string;
        i?:(arg)=>any;
        o?:(arg)=>any;
        il?:string;
        ol?:string;
        t?:any
    }


    export interface SignalShell {
        ins:any //that is a mapping from names to infunctions
        outs:any //that is a mapping from names to signal objects
    }


    export class ResolutionNode {
        ctx:ResolutionContext;
        node:any;

        parent:ResolutionNode;
        depth:number;

        isRoot:boolean;
        root:ResolutionNode;
        prepared:boolean;

        //form fundamental
        ctxmode:string;
        carrier:(arg)=>any;
        resolver:(obj, arg)=>any;
        selector:(keys, arg)=>any;
        preparator:(arg)=>void;

        //form io
        targeting:any;
        inputLabel:string;
        outputLabel:string;
        inputFunction:(arg)=>any;
        outputFunction:(arg)=>any;

        //internal io
        inputNodes:any;
        outputNodes:any;
        signalShell:SignalShell;
        targeted:boolean;

        //internal
        ancestor:ResolutionNode;
        isAncestor:boolean;

        constructor(components:any, form:Form = {}, state:any = {}){

            var context = Util.deepCopy(state);
            var mode = this.ctxmode =  form.m || "";
            this.carrier = form.c || Gentyl.Util.identity;
            this.resolver = form.f || Gentyl.Util.identity;
            this.selector = form.s || function(keys, carg){return true}
            this.preparator = form.p || function(x){}
            this.inputLabel = form.il;
            this.outputLabel = form.ol;
            this.inputFunction = form.i || Gentyl.Util.identity;
            this.outputFunction = form.o || Gentyl.Util.identity;
            this.targeting = form.t;


            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.targeted = false;

            var inductor = this.inductComponent.bind(this);
            this.node = Util.typeCaseSplitF(inductor, inductor, null)(components)

            this.ctx = new ResolutionContext(this, context, mode);

        }

        /**
         * setup the state tree, recursively preparing the contexts
         */
        public prepare(prepargs=null):ResolutionNode{

            //if already prepared the ancestor is reestablished
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;


            if(!this.prepared){
                this.prepared = true;

                this.ctx.prepare();
                this.preparator.call(this.ctx, prepargs);

                //create io facilities for node.
                this.prepareIO();

                //prepare children, object, array, primative
                this.node = Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.node);
            } else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }

            return this;
        }

        private prepareChild(prepargs, child):ResolutionNode{
            if(child instanceof ResolutionNode){
                var replica = child.replicate();

                if (!replica.prepared){
                    //the
                    replica.setParent(this);
                    replica.prepare(prepargs);
                }

                //collect nodes from children allowing parallel input not out
                Util.parassoc(replica.inputNodes, this.inputNodes)
                Util.assoc(replica.outputNodes, this.outputNodes)

                return replica;
            }else{
                return child;
            }
        }

        private prepareIO(){
            this.inputNodes  = {}
            if (typeof(this.inputLabel)  == 'string'){
                this.inputNodes[this.inputLabel] = [this]
            }

            this.outputNodes  = {}
            if (typeof(this.outputLabel)  == 'string'){
                this.outputNodes[this.outputLabel] = this
            }
        }


        replicate(prepargs=null):ResolutionNode{
            if(this.prepared){
                //this node is prepared so we will be creating a new based off the ancestor;
                return this.ancestor.replicate(prepargs)
            }else{

                //this is a raw node, either an ancestor
                var repl = new ResolutionNode(this.node, {
                    f:this.resolver,
                    c:this.carrier ,
                    m:this.ctxmode ,
                    p:this.preparator,
                    il:this.inputLabel,
                    ol:this.outputLabel,
                    i:this.inputFunction,
                    o:this.outputFunction,
                    t:this.targeting,
                    s:this.selector
                }, this.ctx.extract())

                //in the case of the ancestor it comes from prepared
                if(this.isAncestor){
                    repl.ancestor = this;
                    repl.prepare(prepargs);
                }
                return repl
            }
        }

        bundle():Bundle{
            function bundler(node){
                if(node instanceof ResolutionNode){
                    var product = node.bundle()
                    return product
                }else{
                    return node
                }
            }

            var recurrentNodeBundle = Util.typeCaseSplitF(bundler, bundler, null)(this.node)

            var product = {
                node:recurrentNodeBundle,
                form:Gentyl.deformulate(this),
                state:this.ctx.extract()
            }
            return product;
        }


        getTargets(input, root){
            //create submap of the output nodes being only those activted by the current node targeting
            function strtargs(targs, input, root){
                var targets = {};
                if(targs == undefined){
                    //no targets on node
                }else if(targs instanceof Array){
                    for (let i = 0; i < targs.length; i++) {
                        let val = targs[i];
                        if(val in root.outputNodes){
                            targets[val] = root.outputNodes[val]
                        }
                    }
                }else{
                    if(targs in root.outputNodes){
                        targets[targs] = root.outputNodes[targs]
                    }
                }
                //console.log("returned targets:", targets)
                return targets
            }

            if(typeof(this.targeting) == 'function'){
                return strtargs(this.targeting(input), input, root)
            }else{
                return strtargs(this.targeting, input, root)
            }
        }

        shell():SignalShell{

            if(!this.prepared){
                throw new Error("unable to shell unprepared node")
            }

            //implicit root labelling;
            var root = this.getRoot();

            //only operate on root
            root.inputLabel = root.inputLabel || "_";
            root.outputLabel = root.outputLabel || "_";
            root.outputNodes["_"] = root
            root.inputNodes["_"] = [root]
            var inpnodesmap = root.inputNodes;
            var outnodemap = root.outputNodes;


            var shell = {
                ins:{},
                outs:{}
            }

            //create the output signals.
            for(let k in outnodemap){
                shell.outs[k] = new signals.Signal()
            }

            //create input functions
            for(let k in inpnodesmap){
                var v = {inps:inpnodesmap[k], root:root}

                shell.ins[k] = function(data){

                    //construct a map of olabel:Onode that will be activated this time
                    var allTargets = {};
                    var rootInput;

                    for (let i = 0; i < this.inps.length; i++){
                        var inode = <ResolutionNode>this.inps[i];
                        var iresult = inode.inputFunction.call(inode.ctx, data);
                        if(inode == this.root){rootInput = iresult}
                        var targets = inode.getTargets(data, this.root); //Quandry: should it be input function result
                        Util.assoc(targets, allTargets);
                    }

                    if(Object.keys(allTargets).length == 0){return;} //no resolution if no targets

                    for (let key in allTargets) {
                        //console.log("target %s set targets", key, allTargets[key])
                        allTargets[key].targeted = true;  //set allTargets
                    }

                    this.root.resolve(data);           //trigger root resolution. Quandry: should it be input function result

                    for (let key in allTargets) {
                        allTargets[key].targeted = false;  //clear targets
                    }
                }.bind(v)
            }
            root.signalShell = shell;
            return shell
        }


        private inductComponent(component):any{
            var c
            if (component instanceof ResolutionNode){
                c = component
                //c.setParent(this);
            }else if (component instanceof Object){
                c = new ResolutionNode(component)
                //c.setParent(this);
            }else {
                c = component
            }

            return c;
        }

        public getParent(toDepth = 1):ResolutionNode{
            if (this.parent == undefined){
                throw new Error("parent not set, or exceeding getParent depth")
            }else if (toDepth  == 1 ){
                return this.parent
            }else{
                return this.parent.getParent(toDepth - 1)
            }
        }

        public getRoot():ResolutionNode{
            return this.isRoot ? this : this.getParent().getRoot();
        }

        private setParent(parentNode:ResolutionNode){
            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
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
            }else if(selection == true && node instanceof Object){
                //select all
                selection = Object.keys(node);
            }

            //at this stage cut determines primitives are nullified and objects empty

            if (node instanceof Array){
                console.log("array key selection ", selection)

                return cut ? [] : this.resolveArray(node, resolveArgs, selection)
            }
            else if (typeof(node) == "object"){
                if(node instanceof ResolutionNode){
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


        private resolveUnderscore(resolver:ResolutionNode, resolveArgs){
            //now this is the parent context

            var result = resolver.resolve(resolveArgs)

            return result

        }

        resolve(resolveArgs){

            if (!this.prepared){
                this.prepare();
                //throw  Error("Node with state is not prepared, unable to resolve")
            }

            Object.freeze(resolveArgs)
            var carried = this.carrier.call(this.ctx, resolveArgs)

            var resolvedNode
            if(this.node != undefined){
                //form the selection for this node
                var selection =  this.selector.call(this.ctx, Object.keys(this.node), resolveArgs);
                //recurse on the contained node
                resolvedNode = this.resolveNode(this.node, carried, selection)
            }

            //modifies the resolved context and returns the processed result
            var result = this.resolver.call(this.ctx, resolvedNode,  resolveArgs)

            //dispatch if marked
            //console.log(`check Output stage with olabel ${this.outputLabel} reached targeted? , `,this.targeted)
            if(this.targeted){
                var outresult = this.outputFunction.call(this.ctx, result)
                this.getRoot().signalShell.outs[this.outputLabel].dispatch(outresult)
            }

            return result
        }
    }

}
