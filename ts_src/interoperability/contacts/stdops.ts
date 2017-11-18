
import { BaseContact } from './base'
import * as Debug from '../../util/debug'
import { Junction } from '../../util/all'
import { Call } from './call'

export type OpCallTarget = 'carry' | 'resolve' | 'reflex'

export interface StdOpSpec {
    label:string,
    tags?:string[],
    description?:string,

    context: any,

    mode:OpCallTarget

    inner_op?: Function | boolean
    outer_op?: Function | boolean

    hook_outward?: boolean
    hook_inward?:boolean
}





export class StdOp extends Call<StdOp> {

    hook: { inward: (inp) => Junction, outward: (arg) => Junction}

    //capability flags must be decided
    public invertable = true;

    constructor(public spec: StdOpSpec) {
        super()

        this.isSeatable = false;
        this.isTargetable = false;
    }

    // partner integration
    invert(): StdOp {
        let inverted = super.invert()

        this.attachInput()
        inverted.attachInput()

        this.hook = this.createHook()

        return inverted
    }

    createPartner(): StdOp {
        return new StdOp({
            label:'outer:'+this.spec.label,
            mode:this.spec.mode,
            context: this.spec.context,
            inner_op: this.spec.outer_op
        })
    }

    attachInput() {

        if (this.spec.inner_op === true) {
            if(this.spec.mode !== 'resolve'){ 
                this.spec.inner_op = (inp, progress) => {
                    return progress(inp)
                }
            }else{
                this.spec.inner_op = (inp)=>{}
            }
        }
        
        if (this.spec.inner_op instanceof Function) {

            if(this.spec.mode ==='carry'){
                this.partner.isSeatable = true
            } else if(this.spec.mode ==='reflex'){
                this.isSeatable = true;
            }

            this.isTargetable = true;
            this.put = this.createInput()
        }
    }

    createInput(): (inp, crumb) => Junction {

        return (inp, crumb) => {
            let returned = new Junction().mode('single')

            let mycrumb: Debug.Crumb = (crumb || new Debug.Crumb("Begin tracking"))
            .drop("Op Contact Put")
            .at(this.spec.label)
            .with(inp)

            //pass the crumb to the propogation chain (around the outside)
            let targetF;
            if(this.spec.mode == 'carry'){
                let hookF = this.createHookFunction(this.partner) 
                targetF = (inp)=>{
                    let crumb = mycrumb.drop('op-contact-carry')
                    return hookF(inp, crumb)   
                }
            }else if(this.spec.mode =='reflex'){
                let hookF = this.createHookFunction(this)
                targetF = (inp) => {
                    let crumb = mycrumb.drop('op-contact-carry')
                    return hookF(inp, crumb)
                }
            }

            try {
                //the guts
                let result = (<Function>this.spec.inner_op).call(this.spec.context, inp, targetF)
                returned.merge(result, true)

            } catch (e) {
                //trace the push calls leading to this point// (improved stacktrace).
                mycrumb.message = e.message
                let crumback = mycrumb.dump();

                returned.raise({ message: crumback, key: 'OPCRASH' })
            }
            return returned
        }
    }

    createHookFunction(target:StdOp):(inp, crumb?:Debug.Crumb)=>Junction {
        return (inp, crumb?) => {

            let mycrumb: Debug.Crumb = (crumb || new Debug.Crumb("Begin tracking"))
                .drop("Op Contact Hook")
                .at(this.spec.label)
                .with(inp)

            if(target.emit === undefined){
                mycrumb.message = "Frayed End, contact reached not connected to Media"
                let crumback = mycrumb.dump();

                let rv = new Junction();
                rv.raise({ message: crumback, key: 'OP_NOT_CONNECTED' })
                return rv
            }else {
                return target.emit(inp, mycrumb)
            }
        }
    }
   

    createHook():{inward:(inp)=>Junction, outward:(arg)=>Junction} {
        //only called from inner contact

        this.partner.isSeatable = this.partner.isSeatable || this.spec.hook_outward === true
        this.isSeatable = this.isSeatable || this.spec.hook_inward === true

        return {
            inward:(this.isSeatable?this.createHookFunction(this):undefined),
            outward:(this.partner.isSeatable?this.createHookFunction(this.partner):undefined)
        } 
    }

}
