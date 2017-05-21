namespace Jungle {

    /*
        a place where constructs are stored in either static or serial form and recovered from a serial form using a basis
    */
    export class Domain {

        registry:{}
        subspace:{}

        constructor(){
            this.registry = {};
            this.subspace = {};
        }

        branch(key){
            this.subspace[key] = new Domain()
            return this.subspace[key];
        }

        register(key, construct){
            if(key in this.registry){
                throw new Error(`Domain cannot contain duplicates "${key}" is already registered`)
            }else{
                this.registry[key] = construct;
            }
        }

        locateByDotPath(dotpath:string):Domain{
            if(dotpath.match(/^(?:[\w\$]+\.)*(?:[\w\$]+)$/)){
                let subspaces = dotpath.split(/\./);

                let ns = this;
                for(let spacederef of subspaces){
                    if(spacederef in this.subspace){
                        ns = this.subspace[spacederef]
                    }else{
                        throw new Error(`Unable to locate Domain of basis`)
                    }
                }

                return ns

            }else{
                throw new Error(`invalid dotpath syntax: ${dotpath}`)
            }
        }

        recover(construct:SerialConstruct):Construct{

            let basis = this.locateByDotPath(construct.locator).registry[construct.basis];

            if(basis instanceof Function){
                let seed:Construct = new basis(construct.patch, this, construct.locator);
                return seed;
            }else if(basis instanceof Construct){
                return basis.extend(construct.patch)
            }else if(Construct.isSerialConstruct(basis)){
                //registered as a serial pattern find the original basis.
                this.recover(basis).extend(construct.patch)
            }else{
                throw new Error(`Unable to recover construct`)
            }
        }
    }
    //
    // export function N(ns:Domain){
    //     return new Proxy({}, {
    //         get(key){
    //
    //         }
    //     })
    // }
}
