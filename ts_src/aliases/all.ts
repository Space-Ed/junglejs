import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'
import {isPrimative} from '../util/checks'
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

export interface JDescription { basis: string, head: any, body: any }

/**
 * @param basis: the existing domain entry from which to start
 * @param body:  the deeply merged patch 
*/
export function j(basis:string, body?):JDescription
export function j(obj:Object):{basis:'object', head:any, body:any}
export function j(arr:Array<any>):{basis:'array', head:any, body:any}

export function j(basis:any, patch?){

    if(typeof basis === 'string'){
        if(patch === undefined){
            return {basis:basis}
        }else if (Object.getPrototypeOf(patch) === Object.prototype){
            let head = patch.head;
            let heart = patch.heart;

            head.heart = heart;

            delete patch.head;
            delete patch.heart;

            return {
                basis:basis,
                head:head,
                body:patch
            }
        }else{
            return {
                basis: basis,
                body: patch
            }
        }    
    } else if (Object.getPrototypeOf(basis) === Object.prototype ){
        return {
            basis:'object',
            head:basis.head,
            body:basis
        }
    } else if (Object.getPrototypeOf(basis) === Array.prototype){
        return {
            basis:'array',
            anon:basis
        }
    } else if (isPrimative(basis)){
        return {
            basis: typeof basis,
            body:basis
        }
    } else {
        return {
            basis: 'reference',
            body:basis
        }
    }
}
