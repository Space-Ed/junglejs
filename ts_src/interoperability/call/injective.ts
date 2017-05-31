

import * as I from '../base/interfaces'
import {mediaConstructors, BaseMedium} from '../base/medium'
import {Caller, Called} from './crux'

export class InjectiveMedium extends BaseMedium<Caller, Called> {
    roleA:string;
    roleB:string;

    constructor(spec:I.MediumSpec){
        super(spec);

        this.exclusive = true;
        this.roleA = 'caller'
        this.roleB = 'called'
        this.multiA = false,
        this.multiB = false
    }

    inductA(token:string, a:Caller){
    }

    inductB(token:string, b:Called){
    }

    connect(link: I.LinkSpec<Caller, Called>){
        this.matrix.to[link.tokenA][link.tokenB].roleA.func = link.roleB.func
    }

    disconnect(link: I.LinkSpec<Caller, Called>){
        this.matrix.to[link.tokenA][link.tokenB].roleA.func = undefined;
        super.disconnect(link);
    }
}

mediaConstructors['inject'] = InjectiveMedium
