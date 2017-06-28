import {DefaultCell} from "./default";

export class ArrayCell extends DefaultCell{

    nucleus:Array<any>

    constructor(spec){
        super(spec)
        this.nucleus = []
    }

}
