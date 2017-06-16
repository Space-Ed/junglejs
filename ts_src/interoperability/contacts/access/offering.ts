
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import {AccessContact} from './access'
import * as Debug from '../../../util/debug'

export class OfferContact extends BasicContact<AccessContact> implements ProxyHandler<any>{
    //capability flags must be decided
    public  symmetric = false;
    public  invertable = true;

    linkedAccess:any;

    constructor(private accessPolicy?:any){
        super()
        this.linkedAccess = {}
    }

    // partner integration
    invert():AccessContact{
         return super.invert()
    }

    createPartner():AccessContact{
        let partner = new AccessContact(this.accessPolicy)
        partner.setAccessed(this.linkedAccess)
        return partner
    }

    inject(context, key){
        
        //break all links
        this.hidden = true;

        //meaning that the context is offered,
        if(key === undefined){
            this.partner.setAccessed(context)
        }else{
            this.partner.setAccessed(context[key])
        }

    };

    retract(context, key){
        this.partner.setAccessed(this.linkedAccess)
    };


}
