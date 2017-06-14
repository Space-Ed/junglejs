import {deepMeldF} from '../util/ogebra/hierarchical'


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

export function CallInSync(){

}
