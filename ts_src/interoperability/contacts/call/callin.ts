
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import {CallOut} from './callout'
import * as Debug from '../../../util/debug'
import {Junction} from '../../../util/junction'


export class CallIn extends BasicContact<CallOut> {

    hook:any

    //capability flags must be decided
    public symmetric = false;
    public invertable = true;

    constructor(private spec:I.CallContactSpec){
        super()
    }

    public put = (data:any, tracking:Debug.Crumb) =>{

        let crumb;
        if(this.spec.tracking && tracking !== undefined){
            crumb = tracking.drop("CallIn Contact")
            .with(data)
            .at("contact label: " + this.spec.label)
        }

        if(this.partner !== undefined && this.partner.emit !== undefined){
            if(crumb){
                return this.partner.emit(data, crumb);
            }else{
                return this.partner.emit(data);
            }
        }else{
            //hitting a contact without connection, a call to void
            if(tracking){
                tracking.raise("CallIn contact has no corresponding CallOut with emit defined")
            }
        }
    }

    invert():CallOut{
        return super.invert()
    }

    createPartner():CallOut{
         return new CallOut(this.spec)
    }

    inject(into, key){
        this.hook = into;

        if(this.spec.mode == I.CALL_MODE.PUSH){
            //value set reaction - inject setter, remembered default
            Object.defineProperty(into, key, {
                set:(value)=>{
                    let crumb;
                    if(this.spec.tracking){
                        crumb = new Debug.Crumb("Context injection Push Beginning")
                    }
                    //access the membrane and plug the value
                    this.put(value, crumb);
                    this.spec.default = value;
                },get:()=>{
                    return this.spec.default;
                },
                enumerable:true

            })
        }else if(this.spec.mode == I.CALL_MODE.GET){
            //extenral access - inject getter
            Object.defineProperty(into, key, {
                get:()=>{
                    let crumb;
                    if(this.spec.tracking){
                        crumb = new Debug.Crumb("Context injection get Beginning")
                    }

                    let  promised = this.put(undefined, crumb)

                    if(this.spec.syncOnly){
                        let zalgo = promised.realize();

                        if(zalgo instanceof Junction){
                            zalgo.then((result)=>{
                                this.spec.default = result; // update the default later
                            })

                            return this.spec.default //return a default now
                        }else{
                            return zalgo //ok to give sync
                        }
                    }else{
                        return promised
                    }

                },
                enumerable:true
            })
        }else if(this.spec.mode == I.CALL_MODE.REQUEST){
            //external request - inject callable
            Object.defineProperty(into, key, {
                get:()=>{
                    return this.put.bind(this)
                },
                enumerable:true
            })
        }

    }

    retract(context, key){
        delete context.key
    }
}
