
import {Construct} from '../construction/construct'
import {Cell} from './cells/cell'
import {Contact} from '../interoperability/interfaces'
import {Membrane} from '../interoperability/membranes/membrane'
import {RuleMesh} from '../interoperability/mesh/ruleMesh'

export interface AccessPolicy {

}

export interface CellAnchor {
    nucleus:any,
    mesh:RuleMesh,
    lining:Membrane
}

export interface CallHookSpec {
    basis:"CallHook",
    direction:"in"|"out",
    mode:"push"|"pull",
    hook?:any,
    default?:any,
    sync:boolean
}

export interface ConnectorSpec {
    rule:string,
    medium:string
}
