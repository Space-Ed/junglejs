
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
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                crumb.drop("Value Deposit Hook")
                into[key] = inp;
            }
        }else if(this.spec.mode == I.CALL_MODE.GET){
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                crumb.drop("Synchronous Value Retrieval(Get) Hook")
                return into[key]
            }
        }else if(this.spec.mode == I.CALL_MODE.REQUEST){
            into.set(this.spec.hook);
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                crumb.drop("Function Hook")
                return into[key](inp, crumb)
            }
        }
    }

    retract(context, key){

    }

}
