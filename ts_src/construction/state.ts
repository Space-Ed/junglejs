
import {Composite} from './composite'
import {Construct} from './construct'
import {Cell} from '../combination/cells/cell'
import * as I from '../interoperability/interfaces'


export interface StateSpec {

}

/**
 * The state construct manages the exposure of a context object to the various
 * Every cell contains a state
 */
export class Nucleus extends Construct<Cell>{

    target:any;
    exposed:any;

    constructor(spec:StateSpec){
        super(spec)

        this.target = {}
        this.exposed = new Proxy(this.target, this)
    }

    set(oTarget, key:PropertyKey, value):boolean{

        return true
    }

    get(oTarget, key:PropertyKey){
        return oTarget[key]
    }

    prime(){
        //check state consistency
    }

    patch(){

    }

    dispose(){
    }

}
