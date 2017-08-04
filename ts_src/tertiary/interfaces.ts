
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
    basis:"hook:call",
    inject:boolean,
    direction:"in"|"out"|"both",
    type:'hook'|'deposit'|'retrieve'
    hook?:any,
    default?:any
}

export interface ConnectorSpec {
    rule:string,
    medium:string
}
