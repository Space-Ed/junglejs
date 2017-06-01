
import * as I from '../interfaces'
import {BasicContact} from './base'
import {CallOut} from './callout'
import * as Debug from '../../util/debug'


export class CallIn extends BasicContact<CallOut> {

    //capability flags must be decided
    public symmetric = false;
    public invertable = true;

    constructor(private spec:I.CallContactSpec){
        super()
    }

    public put = (data:any, tracking:Debug.Crumb)=>{

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
                tracking.raise("Called contact with no out call")
            }
        }
    }

    invert():CallOut{
        return super.invert()
    }

    createPartner():CallOut{
         return new CallOut(this.spec)
    }

    inject(context, key){

    }

    retract(context, key){

    }
}
