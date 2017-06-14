import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'
import * as Debug from '../../util/debug'
import {deepCopy, Junction} from '../../util/all'

import {Cell} from '../cells/cell'
import {CellAccessory} from '../cells/accessory'
import {CALL_MODE, CallContactSpec, Hookable} from '../../interoperability/interfaces'

import * as I from '../interfaces'

export class CallHook extends CellAccessory {

    contact:IO.CallIn|IO.CallOut;
    cache:I.CallHookSpec

    anchor: I.CellAnchor

    constructor(spec:any){
        spec.basis = 'CallHook';
        super(spec);
    }

    attach(anchor: I.CellAnchor, k:string){
        super.attach(anchor, k)

        let contactargs = {
            label: this.alias,
            tracking:true, //global debug, local debug, denial of tracking, ?
            hook:this.cache.hook,
            syncOnly:this.cache.sync,
            default:this.cache.default,
            mode:{
                'push':CALL_MODE.PUSH,
                'pull':this.cache.sync?CALL_MODE.GET:CALL_MODE.REQUEST
            }[this.cache.mode]

        };

        this.contact = this.cache.direction == "in" ? new IO.CallOut(contactargs) : new IO.CallIn(contactargs);

        this.contact.inject(anchor.nucleus, k);
        anchor.mesh.addContact(k, this.contact)
    }

    detach(){
        this.contact.retract(this.anchor, this.alias)
        this.anchor.mesh.removeContact(this.alias)
    }

    prime(){
        //nothing to do
    }

    patch(patch){
        this.dispose()

    }

    dispose(){
        this.contact.retract(this.anchor, this.alias)
        this.anchor.mesh.removeContact(this.alias)
        //retracting the effect on state
    }

    extract(){
        let cp = deepCopy(this.cache);
        if(this.alive){
            cp.default = this.anchor.nucleus[this.alias]; //the only thing that changes
        }

        return cp;
    }

}

CS.JungleDomain.register('CallHook', CallHook)
