/// <reference path="./util.ts"/>
/// <reference path="./context.ts"/>

namespace Gentyl {

    export interface IOShell {
        ins:any //that is a mapping from names to infunctions
        outs:any //that is a mapping from names to callback context objects
    }

    export class GNode {
        ctx:GContext;
        crown:any;

        parent:GNode;
        depth:number;
        derefChain:(string|number)[]

        isRoot:boolean;
        root:GNode;
        prepared:boolean;

        form:GForm;

        //internal io
        inputNodes:any;
        outputNodes:any;
        ioShell:any;
        outputContext:any;
        outputCallback:string;
        targeted:boolean;

        //internal
        ancestor:GNode;
        isAncestor:boolean;

        constructor(components:any, form:FormSpec = {}, state:any = {}){
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.targeted = false;

            this.form = new GForm(form);

            var context = Util.deepCopy(state);
            this.ctx = new GContext(this, context, this.form.ctxmode);

            var inductor = this.inductComponent.bind(this);
            this.crown = Util.typeCaseSplitF(inductor, inductor, null)(components)

        }

        private inductComponent(component):any{
            var c
            if (component instanceof GNode){
                c = component
                //c.setParent(this);
            }else if (component instanceof Object){
                c = new GNode(component)
                //c.setParent(this);
            }else {
                c = component
            }

            return c;
        }

        /**
         * setup the state tree, recursively preparing the contexts
         */
        public prepare(prepargs=null):GNode{

            if(this.isAncestor){
                throw Error("Ancestors cannot be prepared for resolution")
            }

            // if(this.checkComplete(false)){
            //     throw Error("Unable to prepare, null terminals still present");
            // }

            //if already prepared the ancestor is reestablished
            this.ancestor = this.ancestor || this.replicate();
            this.ancestor.isAncestor = true;

            if(!this.prepared){
                this.prepared = true;

                this.ctx.prepare();
                this.form.preparator.call(this.ctx, prepargs);

                //create io facilities for node.
                this.prepareIO();

                //prepare children, object, array, primative
                this.crown = Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.crown);
            } else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }

            return this;
        }



        private prepareChild(prepargs, child):GNode{
            if(child instanceof GNode){
                var replica = child.replicate();

                replica.setParent(this);
                replica.prepare(prepargs);

                //collect nodes from children allowing parallel input not out
                Util.parassoc(replica.inputNodes, this.inputNodes);
                Util.assoc(replica.outputNodes, this.outputNodes);

                return replica;
            }else{
                return child;
            }
        }

        private prepareIO(){
            this.inputNodes  = {}
            if (typeof(this.form.inputLabel)  == 'string'){
                this.inputNodes[this.form.inputLabel] = [this]
            }

            this.outputNodes  = {}
            if (typeof(this.form.outputLabel)  == 'string'){
                this.outputNodes[this.form.outputLabel] = this
            }
        }


        replicate():GNode{
            if(this.prepared){
                //this node is prepared so we will be creating a new based off the ancestor;
                return this.ancestor.replicate()
            }else{

                //this is a raw node, either an ancestor
                var repl = new GNode(this.crown, this.form.extract(), this.ctx.extract())

                //in the case of the ancestor it comes from prepared
                if(this.isAncestor){
                    repl.ancestor = this;
                }
                return repl
            }
        }

        bundle():Bundle{
            function bundler(node){
                if(node instanceof GNode){
                    var product = node.bundle()
                    return product
                }else{
                    return node
                }
            }

            var recurrentNodeBundle = Util.typeCaseSplitF(bundler, bundler, null)(this.crown)

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

            if(typeof(this.form.targeting) == 'function'){
                return strtargs(this.form.targeting(input), input, root)
            }else{
                return strtargs(this.form.targeting, input, root)
            }
        }

        shell():IOShell{

            if(!this.prepared){
                throw new Error("unable to shell unprepared node")
            }

            //implicit root labelling;
            var root = this.getRoot();

            //only operate on root
            root.form.inputLabel = root.form.inputLabel || "_";
            root.form.outputLabel = root.form.outputLabel || "_";
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
                if(Gentyl.IO.ioShellDefault.dispatch === undefined){
                    //case for a contextless higher order function system
                    shell.outs[k] = outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.setup(k);
                    outnodemap[k].outputContext = undefined;
                }else if(Gentyl.IO.ioShellDefault.setup === undefined){
                    //case fot a contextless direct function
                    shell.outs[k] = outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.dispatch;
                    outnodemap[k].outputContext = undefined;
                }else{
                    //case for contextual callback system
                    var ctx = new Gentyl.IO.ioShellDefault.setup(k);
                    outnodemap[k].outputContext = shell.outs[k] = ctx
                    outnodemap[k].outputCallback = Gentyl.IO.ioShellDefault.dispatch;
                }

            }

            //create input functions
            for(let k in inpnodesmap){
                var v = {inps:inpnodesmap[k], root:root}

                shell.ins[k] = function(data){

                    //construct a map of olabel:Onode that will be activated this time
                    var allTargets = {};
                    var rootInput;

                    for (let i = 0; i < this.inps.length; i++){
                        var inode = <GNode>this.inps[i];
                        var iresult = inode.form.inputFunction.call(inode.ctx, data);
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
            root.ioShell = shell;
            return shell
        }




        public getParent(toDepth = 1):GNode{
            if (this.parent == undefined){
                throw new Error("parent not set, or exceeding getParent depth")
            }else if (toDepth  == 1 ){
                return this.parent
            }else{
                return this.parent.getParent(toDepth - 1)
            }
        }

        public getRoot():GNode{
            return this.isRoot ? this : this.getParent().getRoot();
        }

        public getNominal(label):GNode{
            if(this.form.contextLabel === label){
                return this;
            }else{
                if (this.parent == undefined){
                    throw new Error("Required context label is not found")
                }else{
                    return this.parent.getNominal(label)
                }

            }

        }

        private setParent(parentNode:GNode){
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

        /**
         * create an iterable of all the terminals in the structure
         */
        terminalScan(recursive=false, collection=[], locale=null){
            var locale = locale || this;

            Util.typeCaseSplitF(function(thing, dereferent){
                if(thing instanceof Terminal){
                    collection.push({node:locale, term:thing, deref:dereferent})
                }else if(recursive && thing instanceof GNode){
                    thing.terminalScan(true, collection, locale=thing)
                }//else primitives and non recursion ignored
            })(this.crown);

            return collection
        }

        /**
         * check that there are no terminals in the structure
         */
        checkComplete(recursive=false){
            var result = true;

            Util.typeCaseSplitF(function(thing){
                if(thing instanceof Terminal){
                    result = false;  //falsify result when terminal found
                }else if(recursive && thing instanceof GNode){
                    thing.checkComplete(true)
                }//else primitives and non recursion ignored
            })(this.crown);

            return result;
        }

        /**
            add an extremity to the structure
         */
        add(keyOrVal, val){
            this.inductComponent(val)

            let al = arguments.length
            var ins = null

            if(!(al === 1 || al === 2)){
                throw Error("Requires 1 or 2 arguments")
            }else if(al === 1){
                if (this.crown instanceof Array){
                    ins = this.crown.length;
                    this.crown.push(val)
                }else if(Util.isVanillaObject(this.crown)){
                    throw Error("Requires key and value to add to object crown")
                }else if(this.crown instanceof Terminal){
                    if(this.crown.check(val)){
                        this.crown = val;
                    }
                }else{
                    throw Error("Unable to clobber existing value")
                }
            }else {
                if(Util.isVanillaObject(this.crown)){
                    ins = keyOrVal;
                    this.crown[keyOrVal] = val;
                }else{
                    throw Error("Requires single arg for non object crown")
                }
            }

            //when the structure is prepared as must be the child added.
            if(this.prepared){
                this.crown[ins] = this.prepareChild(null, this.crown[ins])
            }

        }

        /**
         * assure that resolultion will always return a certain type
         */
        seal(typespec){

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
                if(node instanceof GNode){
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

        private resolveUnderscore(resolver:GNode, resolveArgs){
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
            var carried = this.form.carrier.call(this.ctx, resolveArgs)

            var resolvedNode
            if(this.crown != undefined){
                //form the selection for this node
                var selection =  this.form.selector.call(this.ctx, Object.keys(this.crown), resolveArgs);
                //recurse on the contained node
                resolvedNode = this.resolveNode(this.crown, carried, selection)
            }

            //modifies the resolved context and returns the processed result
            var result = this.form.resolver.call(this.ctx, resolvedNode,  resolveArgs)

            //dispatch if marked
            //console.log(`check Output stage with olabel ${this.outputLabel} reached targeted? , `,this.targeted)
            if(this.targeted){
                var outresult = this.form.outputFunction.call(this.ctx, result)
                console.log("Output call back called on output", this.form.outputLabel)

                //when there is a context call upon it otherwise without
                this.outputContext[this.outputCallback](outresult, this.form.outputLabel)

                this.targeted = false;
            }

            return result
        }
    }

}
