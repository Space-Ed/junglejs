namespace Jungle {
    export namespace Nova {
        /*
            a place where constructs are stored in either static or serial form and recovered from a serial form using a basis
        */
        export class Domain {

            registry:{}
            subdomain:{}

            constructor(){
                this.registry = {};
                this.subdomain = {};
            }

            branch(key){
                this.subdomain[key] = new Domain()
                return this.subdomain[key];
            }

            register(key, construct){
                if(key in this.registry){
                    throw new Error(`Domain cannot contain duplicates "${key}" is already registered`)
                }else{
                    this.registry[key] = construct;
                }
            }

            locateDomain(dotpath:string):Domain{
                if(dotpath.match(/^(?:[\w\$]+\.)*(?:[\w\$]+)$/)){
                    let subdomains = dotpath.split(/\./);

                    let ns = this;
                    for(let spacederef of subdomains){
                        if(spacederef in this.subdomain){
                            ns = this.subdomain[spacederef]
                        }else{
                            throw new Error(`Unable to locate Domain of basis`)
                        }
                    }

                    return ns

                }else{
                    throw new Error(`invalid dotpath syntax: ${dotpath}`)
                }
            }

            recover(construct:ConstructSpec):Construct<any>{

                let basis = this.locateDomain(construct.locator).registry[construct.basis];

                if(basis instanceof Function){
                    let seed:Construct<any> = new basis(construct.patch, this, construct.locator);
                    return seed;
                }else if(basis instanceof Construct){
                    return basis.extend(construct.patch)
                }else if(Construct.isConstructSpec(basis)){
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
}
