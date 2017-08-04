import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'
import * as Debug from '../../util/debug'
import {deepCopy, Junction} from '../../util/all'

import {Cell} from '../cells/cell'
import {CellAccessory} from './accessory'

import * as I from '../interfaces'

export class CallHook extends CellAccessory {

    contact:IO.CallExchange;
    cache:I.CallHookSpec

    anchor: I.CellAnchor

    constructor(spec:any){
        super(spec);
    }

    attach(anchor: I.CellAnchor, k:string){
        super.attach(anchor, k)

        let contactargs = {
            tracking:k,
            type:this.cache.type,
            hook:this.cache.hook,
            default:this.cache.default,
            forceSync:false
        }

        this.contact = new ({"in":IO.CallOut, "out":IO.CallIn, "both":IO.CallExchange}[this.cache.direction])(contactargs)

        if(this.cache.inject){
            this.contact.inject(anchor.nucleus, k);
        }

        anchor.lining.addContact( this.contact, k)
    }

    detach(anchor, alias:string){
        this.contact.retract(anchor, alias)
        this.host.lining.removeContact(alias)
    }


    patch(patch){
        this.dispose()

    }

    extract(){
        let cp = deepCopy(this.cache);
        if(this.alive){
            cp.default = this.anchor.nucleus[this.alias]; //the only thing that changes
        }

        return cp;
    }
}
