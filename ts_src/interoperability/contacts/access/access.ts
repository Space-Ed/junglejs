
import * as I from '../../interfaces'
import {BasicContact} from '../base'
import {OfferContact} from './offering'
import * as Debug from '../../../util/debug'

export class AccessContact extends BasicContact<OfferContact> implements ProxyHandler<any>{
    //capability flags must be decided
    public  symmetric = false;
    public  invertable = true;

    handler:ProxyHandler<any>;
    proxy:any;

    constructor(private accessPolicy?:any){
        super()

        this.handler = {
            set(target, property:PropertyKey, value, reciever){
                //console.log(`set ${property} to ${value}`)
                target[property] = value
                return true
            },
            get(target, property:PropertyKey, reciever){
                let gotten = target[property]
                //console.log(`get of ${property} giving ${gotten}`)
                return gotten
            }
        }
    }

    // partner integration
    invert():OfferContact{
        return super.invert()
    }

    createPartner():OfferContact{
        return new OfferContact(this.accessPolicy)
    }


    setAccessed(accessed){
        this.proxy = new Proxy(accessed, this.handler)
    }

    //   return new Partner()

    inject(context, key){
        context[key] = this.proxy
    };

    retract(context, key){
        delete context[key]
    };

}
