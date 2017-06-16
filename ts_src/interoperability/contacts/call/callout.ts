
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import {CallIn} from './callin'
import * as Debug from '../../../util/debug'

export class CallOut extends BasicContact<CallIn> {

    invertable = true;
    symmetric = false;

    constructor(private spec:I.CallContactSpec){
        super()

        if(spec.mode !== I.CALL_MODE.PROXY){
            this.hidden = true
        }
    }

    emit:(data, track?)=>any;

    invert(){
        return super.invert();
    }

    createPartner(){
        return new CallIn(this.spec)
    }

    inject(into, key){
        if(this.spec.mode == I.CALL_MODE.PUSH){
            if(this.spec.hook){
                this.emit = (inp:any, crumb:Debug.Crumb)=>{
                    if(crumb && this.spec.tracking){
                        let end = crumb.drop("Hook Call Terminal")
                            .with(inp)
                            .at(key)
                        }
                    this.spec.hook.call(into, inp, crumb)
                }
            }else{
                this.emit = (inp:any, crumb:Debug.Crumb)=>{

                    if(crumb && this.spec.tracking){
                        let end = crumb.drop("Value Deposit Hook")
                        .with(inp)
                        .at(key)
                    }

                    into[key] = inp;
                }
            }
        }else if(this.spec.mode == I.CALL_MODE.GET){
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                if(crumb && this.spec.tracking){
                    crumb.drop("Synchronous Value Retrieval(Get) Hook")
                    .with(inp)
                    .at(key)
                }
                return into[key]
            }
        }else if(this.spec.mode == I.CALL_MODE.REQUEST){
            //REVIEW: should hook functions be accessible internally
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                if(crumb && this.spec.tracking){
                    crumb.drop("Function Hook")
                    .with(inp)
                    .at(key)
                }
                return this.spec.hook.call(into, inp, crumb)
            }
        }
    }

    retract(context, key){

    }

}
