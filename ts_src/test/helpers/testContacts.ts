
import {Op} from '../../interoperability/contacts/op'

export function Input():Op{
    return new Op({
        context:{},
        minor_op:true,
        minor_return:'carry'
    })
}

export function Output():Op{
    return new Op({
        context:{},
        major_op:true,
        major_return:'carry'
    })
}

export function Duplex():Op{
    return new Op({
        context:{},
        minor_op:true,
        minor_return:'carry',
        major_op:true,
        major_return:'carry'
    })
}
