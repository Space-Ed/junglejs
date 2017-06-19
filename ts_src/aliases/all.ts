import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'
import * as IOI from '../interoperability/interfaces'
import * as T from '../tertiary/interfaces'

export function PushDeposit(defaultValue){
    return {
        basis:'CallHook',
        direction:"in",
        defualt:defaultValue,
        mode:'push'
    }
}

export function Cell(patch){
    return deepMeldF()({
        basis:'Cell'
    },patch)
}

export function Connect(rule:string, medium:string){
    return {
        basis:'Connector',
        rule:rule,
        medium:medium
    }
}

export function Synth(){

}

export function Weave(){

}

export function TunnelIn(mode:'push'|'pull' = 'push'){
    return {
        basis:'CallHook',
        direction:"in",
        mode:mode,
        tracking:true
    }
}

export function TunnelOut(mode:'push'|'pull' = 'push'){
    return {
        basis:'CallHook',
        direction:"out",
        mode:mode,
        tracking:true
    }
}

export function CallInSync(func:(data:any, crumb:Debug.Crumb)=>any){
    return {
        basis:'CallHook',
        direction:"in",
        hook:func,
        mode:'pull'
    }
}
