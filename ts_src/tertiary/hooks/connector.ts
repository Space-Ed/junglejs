import {CellAccessory} from "./accessory";
import * as I from '../interfaces'
import {LinkRule} from '../../interoperability/interfaces'
import {JungleDomain} from '../../construction/domain'

export class Connector extends CellAccessory {

    cache:I.ConnectorSpec

    constructor(spec: I.ConnectorSpec){
        super(spec)
    }

    attach(anchor: I.CellAnchor, label:string){
        anchor.mesh.addRule(this.cache.rule, this.cache.medium, label)
    }

    detach(anchor:I.CellAnchor, label:string){
        anchor.mesh.removeRule(this.cache.medium, label)
    }

}

JungleDomain.register("Connector", Connector, {})
