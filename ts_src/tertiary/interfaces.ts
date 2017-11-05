
import {Construct} from '../construction/construct'
import {Cell} from './cells/cell'
import {Contact} from '../interoperability/interfaces'
import {Membrane} from '../interoperability/membranes/membrane'
import {Weave} from '../interoperability/weave'

export interface AccessPolicy {

}

export interface CellAnchor {
    nucleus:any,
    weave:Weave,
    lining:Membrane
}

export interface CallHookSpec {
    basis:"hook:call",
    direction:"in"|"out"|"both",
    type:'hook'|'deposit'|'retrieve'|'through'
    hook?:any,
    default?:any
}

export interface ConnectorSpec {
    rule:string,
    medium:string
}
