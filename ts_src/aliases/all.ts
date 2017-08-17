import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'
import * as IOI from '../interoperability/interfaces'
import * as T from '../tertiary/interfaces'
import {ExchangeTypes} from '../interoperability/contacts/call/exchange'

//the 4 synchronous call-value conversions

export function PushDeposit(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        type:'deposit',
        direction:"in",
        default:defaultValue
    }
}

export function PullDeposit(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        type:'retrieve',
        direction:"in",
        default:defaultValue
    }
}

export function Reactive(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        default:defaultValue,
        type:'deposit'
    }
}

export function Retrieval(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        type:'retrieve',
        default:defaultValue
    }
}

export function TunnelIn():T.CallHookSpec{
    return {
        basis:'hook:call',
        type: 'through',
        direction:"in"
    }
}

export function TunnelOut():T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        type:'through',
    }
}

export function CallInSync(func:(data:any, crumb:Debug.Crumb)=>any):T.CallHookSpec{
    return {
        basis:'hook:call',
        type:'hook',
        direction:"in",
        hook:func
    }
}

export function Cell(patch){
    return deepMeldF()({
        basis:'cell'
    },patch)
}

export function Connect(rule:string, medium:string){
    return {
        basis:'link',
        rule:rule,
        medium:medium
    }
}
