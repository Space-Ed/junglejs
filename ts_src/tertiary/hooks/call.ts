import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'
import * as Debug from '../../util/debug'
import {deepCopy, Junction} from '../../util/all'

import {Cell} from '../cells/cell'

import * as I from '../interfaces'

export class CallHook extends CS.Construct {

    host:Cell
    contact:IO.CallExchange;
    nucleus:I.CallHookSpec
    spec:I.CallHookSpec

    applyForm(form){
        super.applyForm()
        //this is FUDGE
        this.exposure = 'public'

    }

    attach(anchor:Cell, k:string){
        this.spec = this.nucleus
        this.nucleus = this.nucleus.default
        super.attach(anchor, k)

        let contactargs = {
            tracking:k,
            type:this.spec.type,
            hook:this.spec.hook,
            default:this.nucleus,
            forceSync:false
        }

        this.contact = new ({"in":IO.CallOut, "out":IO.CallIn, "both":IO.CallExchange}[this.spec.direction])(contactargs)

        anchor.lining.addContact(this.contact, k)

        if(this.spec.type !== 'through'){
            this.contact.inject(this.local, 'me')
        }

    }

    detach(anchor, alias:string){
        this.host.lining.removeContact(alias)
    }

    extract(){
        let cp = deepCopy(this.spec);
        cp.default = this.nucleus; //the only thing that changes
        return cp;
    }
}
