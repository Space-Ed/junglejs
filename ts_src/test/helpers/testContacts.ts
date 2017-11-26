
import {StdOp} from '../../interoperability/contacts/stdops'

export function Input():StdOp{
    return new StdOp({
        label: 'Input',
        context: this,
        description: "an input",
        hook_inward: false,
        hook_outward: false,
        mode: 'carry',
        inner_op: false,
        outer_op: true 
    })
}

export function Output():StdOp{
    return new StdOp({
        label: 'output',
        context: this,
        description: "an Output",
        hook_inward: false,
        hook_outward: false,
        mode: 'carry',
        inner_op: true,
        outer_op: false
    })
}

export function Duplex():StdOp{
    return new StdOp({
        label:'duplex',
        context: this,
        description: 'duplex contact with both input and output',
        hook_inward: false,
        hook_outward: false,
        mode: 'carry',
        inner_op: true,
        outer_op: true
    })
}
