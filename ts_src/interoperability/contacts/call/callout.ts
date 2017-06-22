
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
        let _spec = this.spec;
        if(_spec.mode == I.CALL_MODE.PUSH){
            if(_spec.hook){
                this.emit = (inp:any, crumb:Debug.Crumb)=>{
                    if(crumb && _spec.tracking){
                        let end = crumb.drop("Hook Call Terminal")
                            .with(inp)
                            .at(key)
                        }
                    _spec.hook.call(into, inp, crumb)
                }
            }else{
                into[key] = _spec.default;
                this.emit = (inp:any, crumb:Debug.Crumb)=>{

                    if(crumb && _spec.tracking){
                        let end = crumb.drop("Value Deposit Hook")
                        .with(inp)
                        .at(key)
                    }

                    into[key] = inp;
                }
            }
        }else if(_spec.mode == I.CALL_MODE.GET){
            into[key] = _spec.default;



            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                if(crumb && _spec.tracking){
                    crumb.drop("Synchronous Value Retrieval(Get) Hook")
                    .with(inp)
                    .at(key)
                }
                return into[key]
            }
        }else if(_spec.mode == I.CALL_MODE.REQUEST){
            //REVIEW: should hook functions be accessible internally
            this.emit = (inp:any, crumb:Debug.Crumb)=>{
                if(crumb && _spec.tracking){
                    crumb.drop("Function Hook")
                    .with(inp)
                    .at(key)
                }
                return _spec.hook.call(into, inp, crumb)
            }
        }
    }

    retract(context, key){

    }

}
