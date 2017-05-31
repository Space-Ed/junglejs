namespace Jungle {

    export namespace Nova {

        /*

            The construct is a foundational interface that defines all the requirements to being a part of the jungle system.
            The requirements are designed to uphold the principles of:
                nestability: a construct can be part of a composite construct.
                recoverability: every construct can be serialised and recovered elsewhere/when, with a similar state.
                domain-specific: constructions occur within a specified domain.
                declarative construction: construct creation can have effects on context, so long as it is permutable with other creations.
                declarative connectedness: nothing can independently decide to have an effect on something else, it is only with a context that this is possible.


            ****Extending Checklist ****
            - Must serialise with a reconstructable artefact.

        */

        export abstract class Construct<HOST extends Composite>{

            /*
                fundamentally composites need to know if the construct is a living one
            */
            alive:boolean;

            parent:HOST;
            cache:any;
            domain:Domain;
            locator:string;

            constructor(spec:any){
                this.cache = this.ensureObject(spec);
                this.cache.basis = this.cache.basis || 'cell';
                console.log("Create Construct, ",this.cache)

                if(spec.domain instanceof Domain){
                    this.domain = spec.domain;
                }else{
                    this.locator = spec.domain||"";
                }

                this.alive = false;
            }

            /**
             * Ensure that argument is an object
             */
            private ensureObject(spec:any){
                if(spec === undefined){
                    return {}
                }else if(Util.isVanillaObject(spec)){
                    return spec
                }else{
                    throw new Error("Invalid Specification for base Construct, must be object or undefined")
                }
            }

            /*
                perform changes to the host context. Occurs at parent construction time,
                once the membranes are established but before we have reached the root.
            */
            induct(host:HOST, key:string){
                this.parent = host;
                this.domain = this.domain||host.domain.locateDomain(this.locator);
            };

            /*
                Called to perform operations readying for action
                    - called post induct.
                    - recursive for composite.
                    - sets alive
                    - depends on parent
            */
            abstract prime();

            /*
                Called at the end of life of the construct,
                should return it's final form, and also return to being a pattern
                it should retract any changes it enacted on the parent.
            */
            abstract dispose():any

            /*
                output a representation of the construct that may be recovered to a replication
            */
            extract():any{
                return this.cache;
            }

            /*
                modification of live structure by application of a patch, leaving the implementation to the subclasses
            */
            abstract patch(patch:any);


            /*
                as an unprimed construct{pattern} this may occur to create an extended version.
            */
            extend(patch):Construct<HOST> {

                //convert to serial form and extend
                let ext = Util.B()
                    .init(this.extract())
                    .merge(patch)
                    .dump();

                return this.domain.recover(ext)

            }

        }
    }
}
