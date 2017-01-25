namespace Gentyl {
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

                        //in order to get around the resolve restriction
                        shell.base.host.io.specialGate = true;
                        shell.base.host.resolve(baseInput);
                        shell.base.host.io.specialGate = false;
                    }
                }
            }
        }

        export class SpecialInputPort extends ResolveInputPort {
            constructor(private base:ResolveIO){
                super('$');
            }

            handleInput(input){

                var hook = this.base.specialInput;
                var iresult = hook.tractor.call(this.base.host.ctx.exposed, input);

                var inputGate = iresult != IO.HALT && (hook.eager || iresult !== undefined);

                if(inputGate){
                    this.base.specialGate = true;
                    this.base.host.resolve(iresult);
                    this.base.specialGate = false;
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

    }
}
