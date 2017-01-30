namespace Gentyl{

    export namespace IO {


        export class Port{
            callbackContext:any;
            callback:any;

            shells:Shell[];

            constructor(public label){
                this.shells = [];
            }

            /**
             * every kind of port needs to be retrofusable
             */
            addShell(shell){
                this.shells.push(shell)
            }

            designate(designator:PortDesignator):boolean{
                switch (designator.type){
                    case DesignationTypes.ALL :{
                        return true;
                    }
                    case  DesignationTypes.REGEX :{
                        return this.label.match(designator.data);
                    }
                    case DesignationTypes.FUNC:{
                        return designator.data(this);
                    }
                    default:
                        return false;
                }
            }

            dress(coat:OutputCoat){
                this.prepareContext(coat.context);
                this.prepareCallback(coat.callback);
            }

            prepareCallback(callback){
                if(!(typeof(callback)=='string' || typeof(callback) =='function')){
                    throw new Error('Callback must be method name or')
                }

                this.callback = callback;
            }

            prepareContext(outputContext){
                if (typeof(outputContext) == 'function'){
                    this.callbackContext = new outputContext(this);
                }else if (outputContext instanceof Object){
                    this.callbackContext = outputContext;
                }else{
                    throw Error("Invalid context fabrication, must be object or contructor")
                }
            }

            handle(input){
                if(this.callback){
                    if(this.callbackContext){

                        if (typeof(this.callback) == 'string'){
                            let method = this.callbackContext[<string>this.callback];
                            if(method === undefined){
                                throw new Error("method must be accessible in provided context")
                            }

                            method.call(this.callbackContext, input);
                        }else{
                            this.callback.call(this.callbackContext, input)
                        }

                    }else{

                        if (typeof(this.callback) == 'string'){
                            throw new Error("method name can only be given with context");
                        }

                        //dont call globally just go without context;
                        this.callback.call(null, input)
                    }
                }
            }
        }

        /*
            the kind of port used as a "promise but in a consistent form"

            the port uses a gate to determine when its handler is fired so it is a proxy for

            the port is returned to the
        */
        export class GatedPort extends Port{

            gate:Util.Gate;
            deposit:any;
            returned:any;

            constructor(label:any, public host:BaseNode, public complete:(...args:any[])=>any){
                super(label);
                this.gate = new Util.Gate(this.handle, this);
                this.returned = false;
            }

            addTributary(tributary:GatedPort){
                /** when the child calls the gate it unlocks, potentially passing data up the chain
                */

                var unlock = this.gate.lock();
                tributary.callback = unlock

            }

            /**
             * Called by the gate callback in this case
             */
            handle(input){
                //deposit is set within
                this.complete.call(this.host, input);
                this.returned = true;

                super.handle(this.deposit);
            }

            allHome(){
                return this.gate.allUnlocked()
            }

            reset(label:string, completer:(...args)=>any){
                this.label = label;
                this.complete = completer;
                this.callbackContext = undefined;
                this.callback = undefined;
                this.returned = false;
                this.deposit = undefined;
                this.gate.reset();
            }

        }


    }
}
