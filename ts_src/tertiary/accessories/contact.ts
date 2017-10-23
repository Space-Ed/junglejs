import {GDescription} from '../../construction/domain'
import {Construct} from '../../construction/construct'
import {Op, OpCallTarget} from '../../interoperability/contacts/op'
import {Cell} from '../cells/cell'

export interface OpConstructBody {
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

export interface OpDescription extends GDescription<any, OpConstructBody>{}

export class OpConstruct<Body=OpConstructBody> extends Construct{

    spec: OpConstructBody

    init(spec:GDescription<any, Body>){
        super.init(spec)
    }

    attach(host:Cell, key:string){
        super.attach(host, key)

        this.spec = this.nucleus
        this.nucleus = this.spec.default;

        let op = new Op({
            context:this.self,
            major_op:this.spec.major_op,
            major_arg1:this.spec.major_arg1,
            major_arg2:this.spec.major_arg2,
            major_return:this.spec.major_return,

            minor_op:this.spec.minor_op,
            minor_arg1:this.spec.minor_arg1,
            minor_arg2:this.spec.minor_arg2,
            minor_return:this.spec.minor_return,

            hook_op:this.spec.hook_op,
            hook_arg1:this.spec.hook_arg1,
            hook_arg2:this.spec.hook_arg2,
            hook_name:key,
        })

        host.lining.addContact(op, key)
    }

    detach(host:Cell, key:string){
        host.lining.removeContact(key)
    }

    extract(){
        this.spec.default = this.nucleus
        return this.spec
    }
}

export interface StandardOpBody {
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

export interface StandardOpSpec extends GDescription<any, StandardOpBody>{}

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

        let body = spec.body;

        //quickly make sure only one is provided
        let chosen = [];
        for (let i = 0; i < mutexes.length; i++) {
            let m = mutexes[i];
            for(let n of m){
                if (n in body){
                    if(!chosen[i]){
                        chosen[i]=n
                    }else{
                        throw new Error("Cannot specify mulitiple call sources for each side")
                    }
                }

            }
        }

        super.init({
            basis:spec.basis,
            head:spec.head,
            body:{
                default:body.default,
                major_op:body[chosen[0]],
                major_arg1:body.arg1,
                major_arg2:body.arg2,
                major_return:fnameToReturnTarget[chosen[0]],
                minor_op:body[chosen[1]],
                minor_arg1:body.arg1,
                minor_arg2:body.arg2,
                minor_return:fnameToReturnTarget[chosen[1]]
            },
            origins:spec.origins
        })

    }

    attach(host:Cell,key:string){
        super.attach(host, key)

    }

}


export class Drain extends OpConstruct {

    init(desc:any){

        let spec = desc.body;

        spec.open_in = spec.open_in===undefined? true:spec.open_in;
        spec.open_out = spec.open_out===undefined? true:spec.open_out;

        super.init({
            basis:desc.basis,
            head:desc.head,
            body:{
                major_op:spec.open_out?spec.drain:undefined,
                major_return:'resolve',
                minor_op:spec.open_in?spec.drain:undefined,
                minor_return:'resolve'
            },
            origins:desc.origins
        })

        
    }

}


export class Spring extends OpConstruct {

    init(desc:any){

        let spec = desc.body;

        let springF = function(data, carry, reflex){
            if(spec.open_in){
                carry(data)
            }if(spec.open_out){
                reflex(data)
            }
        }

        super.init({
            basis:desc.basis,
            head:desc.head,
            body:{
                hook_op:springF,
                hook_arg1:'carry',
                hook_arg2:'reflex'
            },  
            origins:desc.origins
        })

        Object.defineProperty(this, 'exposed', {
            get: () => {
                return springF
            },
            set: (value) => {
                return false
            }
        })
    }


}
