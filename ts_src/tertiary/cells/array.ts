import {DefaultCell} from "./default";

export class ArrayCell extends DefaultCell{

    nucleus:Array<any>

    constructor(domain?){
        super(domain)
        this.nucleus = []
    }

}
