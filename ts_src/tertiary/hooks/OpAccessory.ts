
import {Construct} from '../../construction/construct'
import {Op, OpCallTarget} from '../../interoperability/contacts/op'
import {Cell} from '../cells/cell'

export interface OpConstructSpec {
    form:any;
    major_op?:Function
    major_arg1?:OpCallTarget
    major_arg2?:OpCallTarget
    major_return?:OpCallTarget
    minor_op?:Function
    minor_arg1?:OpCallTarget
    minor_arg2?:OpCallTarget
    minor_return?:OpCallTarget
    hook_op?:Function
    hook_arg1?:OpCallTarget
    hook_arg2?:OpCallTarget
    default?:any
}

export class OpConstruct extends Construct{

    private spec:OpConstructSpec

    init(spec:OpConstructSpec){
        super.init(spec)
    }

    attach(host:Cell, key:string){
        super.attach(host, key)

        let op = new Op({
            context:this.local,
            major_op:this.nucleus.major_op,
            major_arg1:this.nucleus.major_arg1,
            major_arg2:this.nucleus.major_arg2,
            major_return:this.nucleus.major_return,
            minor_op:this.nucleus.minor_op,
            minor_arg1:this.nucleus.minor_arg1,
            minor_arg2:this.nucleus.minor_arg2,
            minor_return:this.nucleus.minor_return,
            hook_op:this.nucleus.hook_op,
            hook_arg1:this.nucleus.hook_arg1,
            hook_arg2:this.nucleus.hook_arg2,
            hook_name:key,
        })

        this.spec = this.nucleus
        this.nucleus = this.nucleus.default
        host.lining.addContact(op, key)
    }

    detach(host:Cell, key:string){
        host.lining.removeContact(key)
    }

    extract(){
        return this.spec
    }
}

export interface StandardOpSpec {
    form:any,
    resolve_in?:Function,
    carry_in?:Function,
    reflex_in?:Function,
    resolve_out?:Function,
    carry_out?:Function,
    reflex_out?:Function,
    arg1?:OpCallTarget,
    arg2?:OpCallTarget,
    default?:any,
}

const mutexes = [['resolve_out', 'carry_out', 'reflex_out'],['resolve_in', 'carry_in', 'reflex_in']]
const fnameToReturnTarget = {
    'resolve_out':'resolve',
    'resolve_in':'resolve',
    'carry_out':'carry',
    'carry_in':'carry',
    'reflex_out':'reflex',
    'reflex_in':'reflex',
}

export class StandardOp extends OpConstruct {

    init(spec:StandardOpSpec){

        //quickly make sure only one is provided
        let chosen = [];
        for (let i = 0; i < mutexes.length; i++) {
            let m = mutexes[i];
            for(let n of m){
                if (n in spec){
                    if(!chosen[i]){
                        chosen[i]=n
                    }else{
                        throw new Error("Cannot specify mulitiple call sources for each side")
                    }
                }

            }
        }

        super.init({
            form:spec.form,
            default:spec.default,
            major_op:spec[chosen[0]],
            major_arg1:spec.arg1,
            major_arg2:spec.arg2,
            major_return:fnameToReturnTarget[chosen[0]],
            minor_op:spec[chosen[1]],
            minor_arg1:spec.arg1,
            minor_arg2:spec.arg2,
            minor_return:fnameToReturnTarget[chosen[1]],
        })

    }

    attach(host:Cell,key:string){
        super.attach(host, key)

    }

}

export interface DrainSpec {
    drain:Function
    form?:any
    open_in?:boolean
    open_out?:boolean
}


export class Drain extends OpConstruct {

    init(spec:any){

        spec.open_in = spec.open_in===undefined? true:spec.open_in;
        spec.open_out = spec.open_out===undefined? true:spec.open_out;

        super.init({
            form:spec.form,
            major_op:spec.open_out?spec.drain:undefined,
            major_return:'resolve',
            minor_op:spec.open_in?spec.drain:undefined,
            minor_return:'resolve',
        })
    }
}

export interface SpringSpec{
    form?:any,
    open_out:boolean,
    open_in:boolean
}

export class Spring extends OpConstruct {

    init(spec:any){

        let springF = function(data, carry, reflex){
            if(spec.open_in){
                carry(data)
            }if(spec.open_out){
                reflex(data)
            }
        }

        super.init({
            form:spec.form,
            hook_op:springF,
            hook_arg1:'carry',
            hook_arg2:'reflex'
        })
    }

}
