import {ObjectCell} from "./object";

export class ArrayCell extends ObjectCell{

    nucleus:Array<any>

    constructor(domain?){
        super(domain)
        this.nucleus = []
    }

}
