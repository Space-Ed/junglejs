
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import * as Debug from '../../../util/debug'
import {Junction} from '../../../util/all'

export type OpCallTarget = 'carry'|'resolve'|'reflex'

export interface OpSpec {
    context:any,

    major_op?:Function|boolean
    major_return?:OpCallTarget
    major_arg1?:OpCallTarget
    major_arg2?:OpCallTarget

    minor_op?:Function|boolean
    minor_return?:OpCallTarget
    minor_arg1?:OpCallTarget
    minor_arg2?:OpCallTarget

    hook_op?:Function|boolean;
    hook_name?:string;
    hook_arg1?:OpCallTarget;
    hook_arg2?:OpCallTarget;

}

export class Op extends BasicContact<Op> {

    //capability flags must be decided
    public symmetric = true;
    public invertable = true;

    public hasInput:boolean;
    public hasOutput:boolean

    put:(data?:any)=>Junction;
    emit:(data?:any)=>any;

    constructor(public spec: OpSpec){
        super()
        this.hasInput = false;
        this.hasOutput = false
    }

    attachInput(){

        let troubles = [
            this.spec.major_arg1, this.spec.major_arg2 ,this.spec.major_return
        ]

        for(let i =0; i< troubles.length;i++){
            if(troubles[i] === 'carry'){
                this.partner.hasOutput = true
            }else if(troubles[i] ==='reflex'){
                this.hasOutput = true
            }

            for(let j = i+1; j< troubles.length; j++){
                if(troubles[i] !== undefined && troubles[i]==troubles[j]){
                    throw new Error(`Must not have repeated targets, ${this.spec.major_arg1} !== ${this.spec.major_arg2} !== ${this.spec.major_return}`)
                }
            }
        }

        if(this.spec.major_arg2 !== undefined && this.spec.major_arg1 === undefined){
            throw new Error('Must define arg1 before arg2')
        }

        if(this.spec.major_op === true){
            this.spec.major_op = (inp)=>{
                return inp
            }
        }

        if(this.spec.major_op instanceof Function){
            this.hasInput = true;

            this.put = (inp)=>{
                let returned = new Junction().mode('single')

                let arg1 = this.targetCallF(this.spec.major_arg1, returned)
                let arg2 = this.targetCallF(this.spec.major_arg2, returned)

                let result = (<Function>this.spec.major_op).call(this.spec.context, inp, arg1, arg2)

                if(this.spec.major_return === 'resolve'){
                    returned.merge(result, true)
                }else if (this.spec.major_return !== undefined){
                    returned.merge(this.targetCallF(this.spec.major_return)(result), true)
                }

                return returned
            }
        }
    }

    attachHook(){
        let troubles = [
            this.spec.hook_arg1, this.spec.hook_arg2
        ]

        if(troubles.indexOf('carry')>-1){
            this.partner.hasOutput = true
        }
        if(troubles.indexOf('reflex')>-1){
            this.hasOutput = true
        }

        if(this.spec.hook_op !== undefined && this.spec.hook_name!== undefined){
            this.spec.context[this.spec.hook_name] = (inp)=>{
                let arg1 = this.targetCallF(this.spec.hook_arg1)
                let arg2 = this.targetCallF(this.spec.hook_arg2)
                let result = (<Function>this.spec.hook_op).call(this.spec.context, inp, arg1, arg2)
                return result
            }
        }
    }

    targetCallF(target:OpCallTarget, junction?:Junction):Function{
        if(target === 'carry'){
            return this.partner.emit
        }else if(target === 'reflex'){
            return this.emit
        }else if(target === 'resolve' && junction !== undefined){
            return junction.hold()[0]
        }
    }

    // partner integration
    invert():Op {
        let inverted = super.invert()

        this.attachInput()
        inverted.attachInput()

        this.attachHook()

        return inverted
    }

    createPartner():Op {
        return new Op({
            context:this.spec.context,
            major_op:this.spec.minor_op,
            major_arg1:this.spec.minor_arg1,
            major_arg2:this.spec.minor_arg2,
            major_return:this.spec.minor_return
        })
    }

}
