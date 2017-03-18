namespace Jungle{
    export namespace IO {
        export class HookShell extends BaseShell implements Shell {

            //map - array - hook
            inputHooks:any;
            outputHooks:any;

            sinks:any;
            sources:any;

                /**
                 * transform this node into a BaseShell, the kind that has the functions and
                 */
            constructor(public base:ResolveIO, midrantHooks:Hook[], subshells:Shell[]) {

                    super(base, []);

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
                        this.sources[label] = new ResolveOutputPort(label);
                    }

                    for(let shell of subshells){
                        //add output ports of other bases to this one
                        this.addShell(shell);
                    }

                    //create the special IO Ports
                    this.sinks['$'] = new SpecialInputPort(this.base);
                    this.sources['$'] = new ResolveOutputPort('$');


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
             - retrofuse the overlapping
             */
            addShell(shell:Shell){

                for(let k in shell.sinks){
                    let sink = shell.sinks[k]
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

                for(let k in shell.sources){
                    let source = shell.sources[k]
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
