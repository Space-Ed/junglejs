namespace Gentyl {

    export class BaseNode{
        crown:any;
        ctx:GContext;
        form:BaseForm;
        io:IO.IOComponent;
        act:Actions.Component;

        parent:BaseNode;
        depth:number;

        isRoot:boolean;
        root:BaseNode;
        prepared:boolean;

        //internal replication
        ancestor:BaseNode;
        isAncestor:boolean;

        constructor(components:any, form:FormSpec = {}){
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;

            this.form = this.constructForm();

            var {iospec, contextspec} = this.form.parse(form);

            this.ctx = this.constructContext(contextspec);

            //iospec has some injected hooks from ctx
            this.io = this.constructIO(iospec);

            this.act = this.constructActions();

            var inductor = this.inductComponent.bind(this);
            this.crown = Util.typeCaseSplitF(inductor, inductor, null)(components)

        }

        protected constructForm(){
            return new BaseForm(this);
        }

        protected constructIO(iospec):IO.IOComponent{
            return new IO.BaseIO()
        }

        protected constructContext(contextspec){
            return new GContext(this, contextspec)
        }

        protected constructActions(){
            return new Actions.Component(this)
        }

        protected constructCore(crown, form){
            return new BaseNode(crown, form)
        }

        inductComponent(component):any{
            var c
            if (component instanceof BaseNode){
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

        //------------------Construct //// Prepare ------------------------

        /**
         * setup the state tree, recursively preparing the contexts
         */
        public prepare(prepargs=null):BaseNode{

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

                //prepare components
                this.ctx.prepare();
                this.form.preparator.call(this.ctx.exposed, prepargs);

                this.io.prepare(prepargs);

                //prepare children, object, array, primative
                this.crown = Util.typeCaseSplitF(this.prepareChild.bind(this, prepargs))(this.crown);

                this.prepared = true;
            } else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
            }

            // CONTROVERTIAL: does the automatic shelling of the root make sense?
            if(this.isRoot){
                this.enshell()
            }

            return this;
        }

        protected prepareChild(prepargs, child, k):BaseNode{
            if(child instanceof BaseNode){
                var replica = child.replicate();

                replica.setParent(this, k);
                replica.prepare(prepargs);

                return replica;
            }else{
                return child;
            }
        }

        protected setParent(parentNode:BaseNode, dereferent:string|number){

            //append to path
            this.ctx.path = parentNode.ctx.path.concat(dereferent);

            this.parent = parentNode;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        }

        public replicate():BaseNode{
            if(this.prepared){
                //this node is prepared so we will be creating a new based off the ancestor;
                return this.ancestor.replicate()
            }else{

                //this is a raw node, either an ancestor or pattern
                var repl = this.constructCore(this.crown, this.form.consolidate(this.io, this.ctx))

                //in the case of the ancestor it comes from prepared
                if(this.isAncestor){
                    repl.ancestor = this;
                }
                return repl
            }
        }

        public getParent(toDepth = 1):BaseNode{
            if (this.parent == undefined){
                throw new Error("parent not set, or exceeding getParent depth")
            }else if (toDepth  == 1 ){
                return this.parent
            }else{
                return this.parent.getParent(toDepth - 1)
            }
        }

        public getRoot():BaseNode{
            return this.isRoot ? this : this.getParent().getRoot();
        }

        public getNominal(label):BaseNode{
            if(this.ctx.label == label){
                return this;
            }else{
                if (this.parent == undefined){
                    throw new Error(`Required context label ${label} is not found`)
                }else{
                    return this.parent.getNominal(label)
                }
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
                }else if(recursive && thing instanceof BaseNode){
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
                }else if(recursive && thing instanceof BaseNode){
                    thing.checkComplete(true)
                }//else primitives and non recursion ignored
            })(this.crown);

            return result;
        }

        //--------------------------- Prepare //// Serialization -------------------------------

        bundle():Bundle{
            function bundler(node){
                if(node instanceof BaseNode){
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


        enshell(callback?:any, context_factory?:any){
            this.io.enshell(callback, context_factory);

            return this;
        }

        resolve(arg){
            return null;
        }

    }

}
