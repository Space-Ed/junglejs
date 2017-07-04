import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'
import * as Debug from '../../util/debug'
import {deepCopy, Junction} from '../../util/all'

import {Cell} from '../cells/cell'
import {CellAccessory} from './accessory'
import {CALL_MODE, CallContactSpec, Hookable} from '../../interoperability/interfaces'

import * as I from '../interfaces'

export class CallHook extends CellAccessory {

    contact:IO.CallIn|IO.CallOut;
    cache:I.CallHookSpec

    anchor: I.CellAnchor

    constructor(spec:any){
        spec.basis = 'hook:call';
        super(spec);
    }

    attach(anchor: I.CellAnchor, k:string){
        super.attach(anchor, k)//console.log('create contact with ',  this.cache)

        let contactargs:CallContactSpec = {
            label: this.alias,
            tracking:true, //REVIEW: global debug, local debug, denial of tracking, ?
            hook:this.cache.hook,
            syncOnly:this.cache.sync,
            default:this.cache.default,
            mode:{
                'push':CALL_MODE.PUSH,
                'pull':(this.cache.sync )?CALL_MODE.GET:CALL_MODE.REQUEST
            }[this.cache.mode]
        };



        if(this.cache.hook === false){
            //proxied, no hookage
        }else if(this.cache.hook instanceof Function){
            //context hook function
        }else if(this.cache.hook === true){
            //reactive value injection
        }

        if(this.cache.sync){
            //either defaulted or value hooked
        }


        //console.log('contact args', contactargs)

        this.contact = this.cache.direction == "in" ? new IO.CallOut(contactargs) : new IO.CallIn(contactargs);

        this.contact.inject(anchor.nucleus, k);
        anchor.lining.addContact( this.contact, k)
    }

    detach(){
        this.contact.retract(this.anchor, this.alias)
        this.host.lining.removeContact(this.alias)
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
