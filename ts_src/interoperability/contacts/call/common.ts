import {CallIn} from './callin'
import {CallOut} from './callout'
import {CALL_MODE} from '../../interfaces'

export * from './callin'
export * from './callout'
export * from './exchange'
export {CallContactSpec,CALL_MODE} from '../../interfaces'


export function PushOutTrack(){
    return new CallOut({
        label:"PushOut",
        tracking:true,
        syncOnly:false,
        mode:CALL_MODE.PUSH
    })
}

export function PushInTrack(){
    return new CallIn({
        label:"PushOut",
        tracking:true,
        syncOnly:false,
        mode:CALL_MODE.PUSH
    })
}
