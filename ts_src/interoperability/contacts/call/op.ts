
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import * as Debug from '../../../util/debug'
import {Junction} from '../../../util/all'

export type OpCallTarget = 'carry'|'resolve'|'reflex'

export interface OpSpec {
    context:any,

    major_op:Function|boolean
    major_return?:OpCallTarget
    major_arg1?:OpCallTarget
    major_arg2?:OpCallTarget

    minor_op?:Function|boolean
    minor_return?:OpCallTarget
    minor_arg1?:OpCallTarget
    minor_arg2?:OpCallTarget
}

export class Op extends BasicContact<Op> {

    //capability flags must be decided
    public symmetric = true;
    public invertable = true;

    public hasInput:boolean;
    public hasOutput:boolean

    put:(data:any)=>Junction;
    emit:(data:any)=>Junction;

    constructor(public spec: OpSpec){
        super()
        this.hasInput = false;
        this.hasOutput = false
    }

    attachInput(){

        if(this.spec.major_arg1 == this.spec.major_arg2 || this.spec.major_return==this.spec.major_arg1 || this.spec.major_return==this.spec.major_arg2){
            throw new Error(`Must not have repeated targets, ${this.spec.major_arg1} !== ${this.spec.major_arg2} !== ${this.spec.major_return}`)
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
                let result = (<Function>this.spec.major_op).call(this.spec.context, this.targetCallF(this.spec.major_arg1, returned), this.targetCallF(this.spec.major_arg2, returned))

                if(this.spec.major_return === 'resolve'){
                    returned.merge(result)
                }else{
                    returned.merge(this.targetCallF(this.spec.major_return)(result))
                }

                return returned
            }
        }
    }

    targetCallF(target:OpCallTarget, junction?:Junction):Function{
        if(target === 'carry'){
            this.partner.hasOutput = true;
            return this.partner.emit
        }else if(target === 'reflex'){
            this.hasOutput = true;
            return this.emit
        }else if(target === undefined){
            return undefined
        }else if(target === 'resolve'){
            return junction.hold()[0]
        }
    }



    // partner integration
    invert():Op {
        let inverted = super.invert()

        this.attachInput()
        inverted.attachInput()

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
