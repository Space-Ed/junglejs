namespace Jungle {
    export namespace IO {
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
                        var iresult = hook.tractor.call(host.ctx.exposed, input);

                        inputGate = inputGate || (iresult != IO.HALT && (hook.eager || iresult !== undefined));
                        baseInput = baseInput.concat(iresult)

                        //console.log("[input handle hook %s] Handle input: %s", hook.label, iresult)
                    }

                    //don't trigger if no inputs have affirmative
                    if(inputGate){
                        //console.log("[base trigger resolve ] Handle input: ", baseInput)

                        shell.base.host.resolve(baseInput);
                    }
                }
            }
        }

        export class SpecialInputPort extends Port {
            constructor(private base:ResolveIO){
                super('$');
            }

            handleInput(input){
                this.base.host.resolve(input);
            }
        }

        export class ResolveOutputPort extends Port {
            constructor(label:string){
                super(label);
            }

            handle(input){
                super.handle(input);
            }


        }

    }
}
