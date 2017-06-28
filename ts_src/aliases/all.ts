import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'
import * as IOI from '../interoperability/interfaces'
import * as T from '../tertiary/interfaces'

//the 4 synchronous call-value conversions

export function PushDeposit(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"in",
        default:defaultValue,
        mode:'push',
        sync:true,
        hook:true
    }
}

export function PullDeposit(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"in",
        default:defaultValue,
        mode:'pull',
        sync:true,
        hook:true
    }
}

export function Reactive(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        default:defaultValue,
        mode:'push',
        sync:true,
        hook:true
    }
}

export function Retrieval(defaultValue):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        default:defaultValue,
        mode:'pull',
        sync:true,
        hook:true
    }
}

export function TunnelIn(mode:'push'|'pull' = 'push'):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"in",
        sync:true,
        mode:mode,
        hook:false
    }
}

export function TunnelOut(mode:'push'|'pull' = 'push'):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"out",
        sync:true,
        mode:mode,
        hook:false
    }
}

export function CallInSync(func:(data:any, crumb:Debug.Crumb)=>any):T.CallHookSpec{
    return {
        basis:'hook:call',
        direction:"in",
        hook:func,
        mode:'pull',
        sync:false
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

export function Synth(){

}

export function Weave(){

}
