namespace Jungle {

    export class BaseCell{

        kind:string = "Base";

        crown:any;
        ctx:GContext;
        form:BaseForm;
        io:IO.IOComponent;
        act:Actions.Component;

        parent:BaseCell;
        depth:number;

        isRoot:boolean;
        root:BaseCell;
        prepared:boolean;

        //internal replication
        ancestor:BaseCell;
        isAncestor:boolean;

        junction:Util.Junction;

        constructor(components:any, form:FormSpec = {}){
            this.depth = 0;
            this.isRoot = true;
            this.prepared = false;
            this.junction = new Util.Junction();

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
            return new IO.BaseIO(this, iospec)
        }

        protected constructContext(contextspec){
            return new GContext(this, contextspec)
        }

        protected constructActions(){
            return new Actions.Component(this)
        }

        protected constructCore(crown, form){
            return new BaseCell(crown, form)
        }

        inductComponent(component):any{
            var c
            if (component instanceof BaseCell){
                c = component
                //c.setParent(this);
            }else if (component instanceof Object){
                c = new ResolutionCell(component)
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
        public prepare(prepargs=null):BaseCell{

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

                this.ctx.prepare();
                //push to the journey
                this.junction = this.junction
                    .then((results: any, handle: Util.Junction)=>{
                        //prepare components
                        this.ctx.exposed.handle = handle;
                        this.form.preparator.call(this.ctx.exposed, prepargs);
                    }).then((results: any, handle: Util.Junction) => {
                        //prepare children, object, array, primative
                        Util.typeCaseSplitF((child, k)=>this.prepareChild(prepargs, handle, child, k))(this.crown);
                    },false).then((results: any, handle: Util.Junction) => {
                        this.crown = results;
                        this.completePrepare();
                        return this;
                    },false);


                return this.junction.realize();

            } else {
                this.ancestor = this.replicate();
                this.ancestor.isAncestor = true;
                return this;
            }
        }

        completePrepare(){
            this.prepared = true;
            // CONTROVERTIAL: does the automatic shelling of the root make sense?
            if(this.isRoot){
                this.enshell()
            }
        }

        protected prepareChild(prepargs, handle, child, k){

            let mergekey = k === undefined ? false : k;

            if(child instanceof BaseCell){
                var replica = child.replicate();
                replica.setParent(this, k);
                let prepared = replica.prepare(prepargs);

                handle.merge(prepared, mergekey);
            }else{
                handle.merge(child, mergekey);
            }
        }

        protected setParent(parentCell:BaseCell, dereferent:string|number){

            //append to path
            this.ctx.path = parentCell.ctx.path.concat(dereferent);

            this.parent = parentCell;
            this.isRoot = false;
            this.depth = this.parent.depth + 1;
        }

        public replicate():BaseCell{
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

        public getParent(toDepth = 1):BaseCell{
            if (this.parent == undefined){
                throw new Error("parent not set, or exceeding getParent depth")
            }else if (toDepth  == 1 ){
                return this.parent
            }else{
                return this.parent.getParent(toDepth - 1)
            }
        }

        public getRoot():BaseCell{
            return this.isRoot ? this : this.getParent().getRoot();
        }

        public getNominal(label):BaseCell{
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
                }else if(recursive && thing instanceof BaseCell){
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
                }else if(recursive && thing instanceof BaseCell){
                    thing.checkComplete(true)
                }//else primitives and non recursion ignored
            })(this.crown);

            return result;
        }

        //--------------------------- Prepare //// Serialization -------------------------------

        bundle():Bundle{
            function bundler(node){
                if(node instanceof BaseCell){
                    var product = node.bundle()
                    return product
                }else{
                    return node
                }
            }

            var recurrentCellBundle = Util.typeCaseSplitF(bundler)(this.crown)

            var product = {
                core:this.kind,
                crown:recurrentCellBundle,
                form:this.form.consolidate(this.io, this.ctx)
            }

            console.log('bundle: ', product)
            return product;
        }


        enshell(){
            this.io.enshell();

            return this;
        }

        resolve(arg){
            return null;
        }

        X(crown, form){
            var deconstruction = this.bundle();
            return R(Util.melder(deconstruction, {crown:crown, form:form, core:this.constructor}))
        }

    }

}
