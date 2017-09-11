import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'
import * as IOI from '../interoperability/interfaces'
import * as T from '../tertiary/interfaces'
import {ExchangeTypes} from '../interoperability/contacts/call/exchange'

//the 4 synchronous call-value conversions

export function Reset(defaultValue){
    return {
        basis:'contact:op',
        form:{
            exposure:'public'
        },
        resolve_in(data){
            this.me = data
        },
        default:defaultValue
    }
}

export function Get(defaultValue){
    return {
        basis:'contact:op',
        form:{
            exposure:'public'
        },
        resolve_in(data){
            return this.me
        },
        default:defaultValue
    }
}


// export function Notify(defaultValue):T.CallHookSpec{
//     return {
//         basis:'contact:remote',
//         direction:"out",
//         default:defaultValue,
//         type:'deposit'
//     }
// }
//
// export function Fetch(defaultValue):T.CallHookSpec{
//     return {
//         basis:'contact:remote',
//         resolve_in(data){
//             this.me = data
//         },
//         default:defaultValue
//     }
// }

export function Connect(rule:string, medium:string){
    return {
        basis:'link',
        rule:rule,
        medium:medium
    }
}

export function j(basis, patch?){
    if(patch === undefined){
        return {basis:basis}
    }else if (Object.getPrototypeOf(patch) === Object.prototype){
        patch.basis = basis;
        return patch
    }else{
        return {
            basis: basis,
            default: patch
        }
        }
}
