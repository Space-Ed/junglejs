namespace Jungle {

    export namespace IO {


        /**
         * The class of cruxes representing a dressable source which complies to the source and sink roles.
         *
         */
        export class PortCrux extends Crux{

            roles:{
                sink:SinkRole,
                source:SourceRole
            }

            constructor(label:string, private host:MembraneHost, asSink:boolean){
                super(label, host.shell, asSink?'sink':'source')

                //appointment of roles
                this.roles = {
                    sink:{
                        put:(data)=>{
                            this.roles.source.callout(data)
                        }
                    },
                    source:{
                        callout:undefined
                    }
                }
            }

            inversion(role:string){
                return role==='sink'?'source':'sink'
            }

            put(input, trace){
                this.roles.sink.put(input);
            }

            /**
             *Preprocess and add a callout
             */
            dress(coat:OutputCoat){
                let context = this.prepareContext(coat.context);
                let callout = this.prepareCallback(coat.callback);

                if(callout){
                    let closure;
                    if(context){

                        if (typeof(callout) == 'string'){
                            let method = context[<string>callout];
                            if(method === undefined){
                                throw new Error("method must be accessible in provided context")
                            }

                            closure = method.bind(context);
                        }else{
                            closure = callout.bind(context)
                        }
                    }else{
                        if (typeof(callout) == 'string'){
                            throw new Error("method name can only be given with context");
                        }

                        //dont call globally just go without context;
                        closure = callout.bind(null)
                    }

                    this.roles.source.callout = closure

                }


            }

            prepareCallback(callout){
                if(!(typeof(callout)=='string' || typeof(callout) =='function')){
                    throw new Error('Callback must be method name or')
                }

                return callout;
            }

            prepareContext(outputContext){
                if (typeof(outputContext) == 'function'){
                    return new outputContext(this);
                }else if (outputContext instanceof Object){
                    return outputContext;
                }else{
                    throw Error("Invalid context fabrication, must be object or contructor")
                }
            }

        }

    }
}
