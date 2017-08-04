import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'
import * as Debug from '../../util/debug'
import {deepCopy, Junction} from '../../util/all'

import {Cell} from '../cells/cell'
import {CellAccessory} from './accessory'

import * as I from '../interfaces'

export class AccessHook extends CellAccessory {

    contact:IO.AccessContact|IO.OfferContact;
    policy:I.AccessPolicy;

    constructor(spec:any){
        super(spec);

        this.policy = spec.policy;
    }

    attach(anchor: I.CellAnchor, k:string){
        super.attach(anchor, k)

        this.contact = new IO.OfferContact();

        anchor.lining.addContact( this.contact, k)

        if(this.cache.expose && anchor.nucleus){
            //give the whole nucleus
            this.contact.inject(anchor.nucleus, undefined)
        }
    }

    detach(){
        super.detach(this.host, this.alias)
        this.contact.retract(this.host, this.alias)
        this.host.lining.removeContact(this.alias)
    }

}
