

import * as I from '../interfaces'
import {mediaConstructors, BaseMedium} from './medium'
import {CallOut} from '../contacts/callout'
import {CallIn} from '../contacts/callin'

export class DirectMedium extends BaseMedium<CallOut, CallIn> {

    typeA;
    typeB;

    constructor(spec:I.MediumSpec){
        super(spec);
        this.typeA = CallOut;
        this.typeB  = CallIn;
        this.exclusive = true;
        this.multiA = false,
        this.multiB = false
    }

    inductA(token:string, a:CallOut){
    }

    inductB(token:string, b:CallIn){
    }

    connect(link: I.LinkSpec<CallOut, CallIn>){
        //link directly
        link.contactA.emit = link.contactB.put
    }

    disconnect(link: I.LinkSpec<CallOut, CallIn>){
        link.contactA.emit = undefined;
        super.disconnect(link);
    }
}

mediaConstructors['direct'] = DirectMedium
