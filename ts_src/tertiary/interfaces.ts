
import {Construct} from '../construction/construct'
import {Cell} from './cells/cell'
import {Contact} from '../interoperability/interfaces'
import {Membrane} from '../interoperability/membranes/membrane'


export interface AccessPolicy {
    
}

export interface CellAnchor {
    nucleus:any,
    mesh:Membrane
}

export interface CallHookSpec {
    direction:"in"|"out",
    mode:"push"|"pull",
    hook:any,
    default:any,
    sync:boolean
}
