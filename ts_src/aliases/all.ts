import {deepMeldF} from '../util/ogebra/hierarchical'
import * as Debug from '../util/debug'

import * as IOI from '../interoperability/interfaces'

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

export function Synth(){

}

export function Weave(){

}

export function TunnelIn(){

}

export function CallInSync(func:(data:any, crumb:Debug.Crumb)=>any){
    return {
        basis:'CallHook',
        direction:"in",
        hook:func,
        mode:'pull'
    }
}
