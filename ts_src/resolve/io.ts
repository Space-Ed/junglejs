namespace Jungle {
    export namespace IO{

        export interface Hook {
            host:ResolutionCell,
            label:string,
            tractor:Function,
            orientation:Orientation,
            eager:boolean,
            reactiveValue?:boolean
        }



        function orientationChange(child, node):Orientation{
            if(child === Orientation.OUTPUT && node === Orientation.INPUT){
                return Orientation.INPUT;
            }else if (child === Orientation.INPUT && node === Orientation.OUTPUT){
                return Orientation.OUTPUT;
            }else if(node === Orientation.MIXED){}
        }

        function orientationConflict(child1, child2){
            return (child1 === Orientation.OUTPUT && child2 === Orientation.INPUT)
            || (child1 === Orientation.INPUT && child2 === Orientation.OUTPUT)
        }

        export class ResolveIO extends BaseIO implements IOComponent{
            //the internal collection of io ports
            hooks:Hook[];
            orientation:Orientation;
            isShellBase:boolean;
            base:ResolveIO;

            specialInput:Hook;
            specialOutput:Hook;
            specialGate:boolean;

            // \/\/\/ Defined for shelled only below \/\/\/

            //the map of callable input functions and output ports attributed to this node.
            inputs:any;
            outputs:any

            //the io hooks called by ports
            inputHooks:any;
            outputHooks:any;

            //the conformant array of ports
            shell:HookShell;
            host:ResolutionCell;

            constructor(host:ResolutionCell, iospec){
                super(host, iospec);
                var {hooks, specialIn, specialOut} = iospec;

                this.isShellBase = false;
                this.specialGate = false;
                this.orientation = Orientation.NEUTRAL;

                this.inputs = {};
                this.outputs = {};

                this.initialiseHooks(hooks, specialIn, specialOut);

            }

            prepare(){

            }

            //get the tractor functions back
            extract(){
                var ext = {};
                var hook:Hook
                for (hook of this.hooks){

                    var scores = hook.eager ? '__' : '_'
                    var isinp = hook.orientation == Orientation.INPUT  || hook.orientation == Orientation.MIXED;
                    var isout = hook.orientation == Orientation.OUTPUT || hook.orientation == Orientation.MIXED;

                    var label = (isinp?scores:'')+hook.label+(isout?scores:'')

                    if(!hook.reactiveValue){
                        ext[label] = hook.tractor;
                    }
                }

                return ext
            }




            initialiseHooks(hooks:Hook[], specialIn:Hook, specialOut:Hook){
                this.hooks = [];

                this.specialInput = specialIn
                this.specialOutput = specialOut

                this.inputHooks = {};
                this.outputHooks = {};

                for (var hook of hooks){
                    this.addHook(hook)
                }
            }

            /**
                add a hook to this node io that will be picked up by the shelling process to form ports.
                at this stage we inform the inital orientation of the node based off this and other added hooks
            */
            addHook(hook:Hook){
                var {label, tractor, orientation} = hook

                //update form orientation.
                if(this.orientation == Orientation.NEUTRAL){
                    this.orientation = orientation
                }else if(orientation != this.orientation){
                    this.orientation = Orientation.MIXED;
                }//else it is not changing

                var label = label;

                //tractors accessible by label
                if(orientation == Orientation.INPUT){
                    //input
                    this.inputHooks[label] = hook
                }else if(orientation == Orientation.OUTPUT){
                    //output
                    this.outputHooks[label] = hook
                }

                this.hooks.push(hook)

            }

            enshell(){

                if(!this.host.prepared){
                    throw new Error("unable to shell unprepared node")
                }

                //recursively check and correct the order of io-nodes
                this.reorient();

                //regardless of orientation this is the designated base.
                this.isShellBase = true;

                this.collect();

                return this.shell;

            }

            /**
             * set the isShellBase flag to true if the node is inverting
             * that is if any of the children are of opposing orientation or if this is mixed
             * if any siblings offer conflicting orientations then an error is created
             * allow neutral nodes to inherit the above
             */
            reorient(){
                var inverted = false;
                var upperOrientation

                //only valid for composite crown.

                if(!Util.isPrimative(child)){
                    for (var child of this.host.crown){
                        if (child instanceof ResolutionCell){
                            child = <ResolutionCell> child;
                            child.io.reorient();

                            var upo = child.io.orientation;

                            if(child.io.isShellBase && upo != Orientation.NEUTRAL){
                                //child has moot orientation
                                continue;
                            }
                            else if(!upperOrientation || !orientationConflict(upperOrientation, upo)){
                                //child has similar or is first
                                upperOrientation = upo;
                            }else{
                                //child has different to the others, lateral conflict
                                throw new Error("Cannot have siblings with dissimilar io orientation");
                            }
                        }
                    }
                }else{
                    upperOrientation = Orientation.NEUTRAL;
                }

                if(orientationConflict(upperOrientation, this.orientation)){
                    //vertical conflict - inversion;
                    this.isShellBase = true;
                }

                if (this.orientation === Orientation.MIXED){
                    //mixed must be base
                    this.isShellBase = true;
                }

                if(this.orientation == Orientation.NEUTRAL){
                    //percolate orientation toward root
                    this.orientation = upperOrientation
                    this.isShellBase = false;
                }
            }

            collect():{hooks:Hook[], shells:Shell[]} {
                //if child is an inversion node then shell it else provide the io map to the accumulated nodes

                //begin with the hooks of this node
                var accumulated = {
                    hooks:[].concat(this.hooks),
                    shells:[]
                };

                const accumulator = function(child, k, accumulated : {hooks:Hook[], shells:Shell[]}) : {hooks:Hook[], shells:Shell[]}{
                    child = <ResolutionCell> child;
                    let {hooks, shells} = child.io.collect();
                    return {hooks: accumulated.hooks.concat(hooks), shells: accumulated.shells.concat(shells)};
                }

                //singular case handling
                if (!Util.isVanillaObject(this.host.crown) && !Util.isVanillaArray(this.host.crown)){
                    if(this.host.crown instanceof ResolutionCell){
                        accumulated = accumulator(this.host.crown, null, accumulated);
                    }
                }else{

                    for (var k in this.host.crown){
                        let child = this.host.crown[k];
                        if(child instanceof ResolutionCell){
                            child = <ResolutionCell> child;
                            accumulated = accumulator(child, k, accumulated);
                        }else if (child instanceof BaseCell){
                            child = <BaseCell> child;

                            //on other node
                            if(child.io.shell != undefined){
                                accumulated.shells.push(child.io.shell);
                            }
                        }
                    }
                }

                //shell creation post recurse means leaves shell first
                if(this.isShellBase){

                    //special hooks are needed at this point, by default they will trigger and pass.
                    this.specialInput  = this.specialInput || {tractor:passing, label:'$', host:this.host, orientation:Orientation.INPUT, eager:true};
                    this.specialOutput = this.specialOutput|| {tractor:passing, label:'$', host:this.host, orientation:Orientation.OUTPUT, eager:true};

                    //compile the accumulated hooks into a single shell
                    this.shell = new HookShell(this, accumulated.hooks, accumulated.shells);

                    //aliased input function by binding the outward facing port to the host
                    for(let k in this.shell.sinks){
                        this.inputs[k] = (function(input){
                            this.shell.sinks[k].handle(input);
                        }).bind(this);
                    }
                    //recover the output sources
                    for(let k in this.shell.sources){
                        this.outputs[k] = this.shell.sources[k];
                    }

                    return {shells:[this.shell], hooks:[]}
                }else{
                    return {hooks: accumulated.hooks, shells:accumulated.shells};
                }
            }



            dispatchResult(result:any){
                var baseResult

                for (let k in this.outputHooks){
                    let hook = <Hook>this.outputHooks[k]
                    let oresult = hook.tractor.call(this.host.ctx.exposed, result)

                    if((oresult != HALT && (hook.eager || oresult != undefined))){
                        let port:ResolveOutputPort = this.base.shell.sources[k]; //the base has collected one for each label
                        port.handle(oresult);
                    }
                }

                if(this.isShellBase){
                    baseResult = this.specialOutput.tractor.call(this.specialOutput.host.ctx.exposed, result);

                    if((baseResult != HALT && (this.specialOutput.eager || baseResult != undefined))){
                        let port:ResolveOutputPort = this.shell.sources.$; //the base has collected one for each label
                        port.handle(baseResult);
                    }
                }else{
                    baseResult = result;
                }

                return baseResult

            }
        }
        }

    }
