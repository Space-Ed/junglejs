
import {Construct} from './construct'

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
        this.registry[key] = construct;
        // if(key in this.registry){
        //     throw new Error(`Domain cannot contain duplicates "${key}" is already registered`)
        // }else{
        // }
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

        }else if (dotpath === ""){
            return this
        }else{
            throw new Error(`invalid dotpath syntax: ${dotpath}`)
        }
    }

    recover(construct):Construct<any>{
        ///TODO: Basis accessors a.b:Basis
        let basis = this.registry[construct.basis];

        try {
            return new basis(construct);
        }catch (e){
            console.error("basis: ",construct.basis," not a constructor in registry")
            throw e
        }
    }
}

export const JungleDomain = new Domain();

//
// export function N(ns:Domain){
//     return new Proxy({}, {
//         get(key){
//
//         }
//     })
// }
