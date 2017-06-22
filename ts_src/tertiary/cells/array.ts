import {JungleDomain} from "../../construction/domain";
import {DefaultCell} from "./default";

export class ArrayCell extends DefaultCell{

    nucleus:Array<any>

    constructor(spec){
        super(spec)
        this.nucleus = []        
    }

}

JungleDomain.register('array', ArrayCell)
