
import {CallIn, CallOut} from '../../interoperability/contacts/call/common'

export function PushInTrack(){
    return new CallIn({
        type:'deposit',
        tracking:true,
        default:'pushIn',
    })
}

export function PushOutTrack(){
    return new CallOut({
        type:'deposit',
        tracking:true,
        default:'pushOut',
    })
}
