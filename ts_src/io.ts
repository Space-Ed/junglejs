namespace Gentyl {
    export namespace IO{

        export const HALT = {};
        Object.freeze(HALT)

        function halting(arg){
            return HALT
        }

        function passing(arg){
            return arg;
        }

        function defined(arg){
            return arg === undefined ? HALT : arg;
        }

        function always(arg){
            return true;
        }

        function nothing(arg){
            return undefined
        }

        function host(arg){
            //from the context
            return this.host
        }

        export enum Orientation{
            INPUT, OUTPUT, NEUTRAL, MIXED
        }


        export interface Hook {
            host:GNode,
            label:string,
            tractor:Function,
            orientation:Orientation
        }

        export class Port{

            callbackContext:any;
            callback:(output, ...args)=>any;


            shells:Shell[];

            constructor(public label){
                this.shells = [];
            }

            /**
             * every kind of port needs to be retrofusable
             */
            addShell(shell:Shell){
                this.shells.push(shell)
            }

            handle(input){
                if(this.callback){
                    if(this.callbackContext){
                        //call toward target
                        this.callback.call(this.callbackContext, input)
                    }else{
                        //dont call globally just use the port as context;
                        this.callback.call(this, input)
                    }
                }
            }
        }

        /**
         * This class handles dispersing over all the hosts with a label like
         */
        export class ResolveInputPort extends Port{

            shells:HookShell[];

            constructor(label, ...shells:HookShell[]){
                super(label)
                this.callback = this.handleInput
                this.callbackContext = this

                for(var shell of shells){
                    this.addShell(shell);
                }
            }

            handleInput(input){

                for (var shell of this.shells){

                    var inputGate = false;
                    var baseInput = [];

                    var hooks:Hook[] = [].concat(shell.inputHooks[this.label] || []);

                    for (var hook of hooks){
                        var host = hook.host;
                        var iresult = hook.tractor.call(host.ctx, input);
                        inputGate = inputGate || iresult != HALT;
                        baseInput = baseInput.concat(iresult)

                        console.log("[input handle hook %s] Handle input: %s", hook.label, iresult)
                    }

                    //don't trigger if no inputs have affirmative
                    if(inputGate){
                        console.log("[base trigger resolve ] Handle input: ", baseInput)

                        //in order to get around the resolve restriction
                        shell.base.host.io.specialGate = true;
                        shell.base.host.resolve(baseInput);
                        shell.base.host.io.specialGate = false;
                    }
                }
            }

        }

        export class ResolveOutputPort extends Port {
            constructor(label:string, outputCallback, outputContext){
                super(label);
                this.callback = outputCallback;
                this.callbackContext = this.prepareContext(outputContext);
            }

            prepareContext(outputContext){
                if (typeof(outputContext) == 'function'){
                    return new outputContext(this);
                }else if (typeof(outputContext)== 'object'){
                    return outputContext;
                }else{
                    return this
                }
            }
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

        export class Component {
            //the internal collection of io ports
            hooks:Hook[];
            orientation:Orientation;
            isShellBase:boolean;
            base:Component;

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

            constructor(public host:GNode, initHooks:Hook[]){

                this.isShellBase = false;
                this.specialGate = false;
                this.orientation = Orientation.NEUTRAL;

                this.inputs = {};
                this.outputs = {};

                this.initialiseHooks(initHooks);

            }

            prepare(){

            }

            //get the tractor functions back
            extract(){
                var ext = {};

                for (var {tractor} of this.hooks){
                    ext[(<any>tractor).name] = tractor;
                }

                return ext
            }


            initialiseHooks(hooks:Hook[]){
                this.hooks = [];
                this.specialInput = {tractor:halting, label:'$', host:this.host, orientation:Orientation.INPUT};
                this.specialOutput = {tractor:halting, label:'$', host:this.host, orientation:Orientation.OUTPUT};
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
                //
                // if(label = '$'){
                //     if(orientation == Orientation.INPUT){
                //         //input
                //         this.specialInput = hook;
                //     }else if(orientation == Orientation.OUTPUT){
                //         //output
                //         this.specialOutput = hook;
                //     }
                // }else{
                //
                //
                //
                // }
            }

            enshell(opcallback, opcontext?){

                if(!this.host.prepared){
                    throw new Error("unable to shell unprepared node")
                }

                //recursively check and correct the order of io-nodes
                this.reorient();

                //regardless of orientation this is the designated base.
                this.isShellBase = true;

                this.collect(opcallback, opcontext);

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
                for (var child of this.host.crown){
                    if (child instanceof GNode){
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

            collect(opcallback, opcontext?):{hooks:Hook[], shells:Shell[]} {
                //if child is an inversion node then shell it else provide the io map to the accumulated nodes

                //begin with the hooks of this node
                var accumulatedHooks = [].concat(this.hooks);
                var accumulatedShells = [];

                for (var k in this.host.crown){
                    var child:GNode = this.host.crown[k]
                    if(child.io != undefined){
                        let {hooks, shells} = child.io.collect(opcallback, opcontext);
                        accumulatedHooks = accumulatedHooks.concat(hooks);
                        accumulatedShells = accumulatedShells.concat(shells);
                    }
                }

                if(this.isShellBase){
                    //compress the accumulated hooks into a new base


                    this.shell = new HookShell(this, accumulatedHooks, accumulatedShells, opcallback, opcontext);

                    //aliased input function by binding the outward facing port to the host
                    for(let k in this.shell.sinks){
                        this.inputs[k] = (function(input){
                            console.log("[input closure] Handle input: ", input)
                            this.shell.sinks[k].handle(input);
                        }).bind(this);
                    }
                    //recover the output sources
                    for(let k in this.shell.sources){
                        this.outputs[k] = this.shell.sources[k];
                    }

                    return {shells:[this.shell], hooks:[]}
                }else{
                    return {hooks: accumulatedHooks, shells:accumulatedShells};
                }


            }



            dispatchResult(result:any){
                var baseresult

                for (let k in this.outputHooks){

                    console.log("[dispatch result] Handle result: %s , to hook ", result)
                    console.log(this.outputHooks[k])


                    var oresult = (<Hook>this.outputHooks[k]).tractor.call(this.host.ctx, result)

                    if(oresult != HALT){
                        let port:ResolveOutputPort = this.base.shell.sources[k]; //the base has collected one for each label
                        port.handle(oresult);
                    }
                }

                return baseresult

            }
        }

        export interface Shell {
            sinks:any;
            sources:any;
        }

        export class HookShell implements Shell{

            //map - array - hook
            inputHooks:any;
            outputHooks:any;

            sinks:any;
            sources:any;

                /**
                 * transform this node into a BaseShell, the kind that has the functions and
                 */
            constructor(public base:Component, midrantHooks:Hook[], subshells:Shell[], opcallback, opcontext?) {

                    this.sources = {};
                    this.sinks = {};
                    this.inputHooks = {};
                    this.outputHooks = {};

                    //add hooks for inputs of base to call
                    for (let hook of midrantHooks){
                        this.addMidrantHook(hook)
                    }

                    //create ports based off labels
                    for(let label in this.inputHooks){
                        this.sinks[label] = new ResolveInputPort(label, this);
                    }

                    for(let label in this.outputHooks){
                        this.sources[label] = new ResolveOutputPort(label, opcallback, opcontext);
                    }

                    for(let shell of subshells){
                        //add output ports of other bases to this one
                        this.addShell(shell);
                    }

                }

                /**
                 * Handle the compaction of midrant hooks into label based arrays
                 */
                addMidrantHook(hook:Hook){
                    hook.host.io.base = this.base;

                    if(hook.orientation === Orientation.INPUT){
                        this.inputHooks[hook.label] = (this.inputHooks[hook.label]||[]).concat(hook)

                    }else if (hook.orientation === Orientation.OUTPUT){
                        this.outputHooks[hook.label] = (this.outputHooks[hook.label]||[]).concat(hook)
                    }
                }

                /**
                 * Bring the subshell forward,
                 - subsume the uncommon sinks
                 - retrofuse
                 */
                addShell(shell:Shell){

                    for(let sink of shell.sinks){
                        if(sink.label in this.sinks){
                            //retrofusion
                            let outerSink = <ResolveInputPort>this.sinks[sink.label];
                            outerSink.addShell(this)

                            //all the shells of the fused sink now must ref the outermost
                            for(let shell of sink.shells){
                                (<HookShell>shell).sinks[sink.label] = outerSink;
                            }

                            //now "sink" should be GC

                        }else{
                            //subsumption
                            this.sinks[sink.label] = sink;
                        }
                    }

                    for(let source of shell.sources){
                        if(source.label in this.sources){
                            //retrofusion
                            let outerSource = <ResolveOutputPort>this.sources[source.label];
                            outerSource.addShell(this)

                            //all the shells of the fused source now must ref the outermost
                            for(let shell of source.shells){
                                (<HookShell>shell).sources[source.label] = outerSource;
                            }

                            //now "source" should be GC

                        }else{
                            //subsumption
                            this.sources[source.label] = source;
                        }
                    }

                }

            }
        }

    }
