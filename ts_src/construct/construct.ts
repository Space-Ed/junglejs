namespace Jungle {


    export interface ConstructHost {
        io:IO.BaseIO,
        ctx:GContext
    }

    export interface SerialConstruct {
        basis:string,
        patch:any,
    }

    /*

        ****CONSTRAINTS****
        - Must have an entry in the registry
        - Must have the abstract methods implemented
        - Must serialise with a reconstructable artefact.

    */
    export abstract class Construct {

        static isSerialConstruct(construct:any){
            return "basis" in construct && "space" in construct && "arg" in construct;
        }

        constructor(){
        }

        /*
            perform changes to the host context. Occurs at parent construction time,
            once the context and membranes are established but before these are accessable.
        */
        abstract induct(host:ConstructHost, key:string);

        /*
            Called to perform, operations resting upon the context
        */
        abstract prime(platform:IO.Membrane);

        /*
            Called at the end of life of the construct,
            should return it's final form, and also return to being a pattern
            it should retract any changes it enacted on the parent.
        */
        abstract retract():any

        /*
            output a representation of the construct that may be recovered to a replication
        */
        abstract extract():SerialConstruct

        /*
            as an unprimed construct{pattern} this may occur to create an extended version.
        */
        extend(patch):Construct {

            //convert to

            let ext = Util.B()
                .init(this.extract())
                .merge({patch:patch})
                .dump();

            return this.space.recover(ext)

        }

    }

}
