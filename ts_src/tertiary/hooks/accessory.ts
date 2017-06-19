
import {Domain} from '../../construction/domain'
import {Construct} from '../../construction/construct'
import {Cell} from '../cells/cell'

import * as I from '../interfaces'


export class CellAccessory extends Construct {

    host:I.CellAnchor;
    alias:string;

    attach(host:I.CellAnchor, alias:string){
        super.attach(host, alias)
    }

    detach(host:I.CellAnchor, alias:string){
        super.detach(host, alias)
    }

    /*
        Called to bring the the construct to life, it is given it's domain, that represents the set of components available to it
    */
    prime(domain?:Domain){
        super.prime(domain)
    };

    /*
        Called at the end of life of the construct.
        should return it's final form, and also return to being a pattern
        it should retract any changes it enacted on the parent.
    */
    dispose():any{
        return this.cache;
    }

    /*
        output a representation of the construct that may be recovered to a replication
    */
    extract():any{
        return this.cache;
    }

    /*
        modification of live structure by application of a patch, leaving the implementation to the subclasses
    */
    patch(patch:any){

    }

}
