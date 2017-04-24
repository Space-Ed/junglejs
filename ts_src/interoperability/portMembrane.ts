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


            constructor(label, origin, initialRole){
                super(label, origin, initialRole)

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

            clone(label){
                return new PortCrux(label, this.origin, this.role)
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

        export class PortMembrane extends Membrane {

            roles:{
                source:any,
                sink:any,
            }

            get sources(){
                return this.roles.source
            }

            get sinks(){
                return this.roles.sink
            }

            /**
             * Take a designator object and, finding the sources, apply a coat
             */
            dress(designator:CruxDesignator, coat:OutputCoat){
                designator.role = 'source'
                let designation = <PortCrux[]>this.designate(designator);
                for(let k in designation){
                    let outport = designation[k];
                    outport.dress(coat);
                }

            }

            /**
             * Parse the standard IO name format _sinkname sourcename_ and plant them respectively
             */
            populate(labels){
                var validPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/
                for (let i = 0; i < labels.length; i++) {
                    let pmatch = labels[i].match(validPortRegex);

                    if(pmatch){
                        let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                        if(inp){
                            this.addCrux(new PortCrux(label), "sink")
                        }
                        if(out){
                            this.addCrux(new PortCrux(label), "source")
                        }
                    }else{
                        throw new Error("Invalid port label type, must be _<sink label> (leading underscore) or <source label>_ (trailing underscore)")
                    }
                }
            }

        }

    }
}
