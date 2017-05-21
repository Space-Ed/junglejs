namespace Jungle {
    export class Composite extends Construct {

        crown:any;
        primed:boolean;

        constructor(){
            super()
            this.crown = {}
        }

        add(construct:Construct, key){

            //replicat
            let cstr;
            if(construct.isPattern){
                cstr = this.space.recover(construct)
            }else{
                cstr = construct
            }

            //induct
            this.crown[key] = cstr;

            //prime
            if(this.primed){
                cstr.prime()
            }
        }

        remove(construct){


        }

        /*
            perform changes to the host context. Occurs at parent construction time,
            once the context and membranes are established but before these are accessable.
        */
        induct(host:ConstructHost, key:string){

        };


        prime(){

        };

        /*
            Called at the end of life of the construct,
            should return it's final form, and also return to being a pattern
            it should retract any changes it enacted on the parent.
        */
        dispose():any{

        }

        /*
            output a representation of the construct that may be recovered to a replication
        */
        extract():SerialConstruct {

        }

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
