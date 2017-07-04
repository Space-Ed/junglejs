import {CellAccessory} from "./accessory";
import * as I from '../interfaces'
import {LinkRule} from '../../interoperability/interfaces'

export class Connector extends CellAccessory {

    cache:I.ConnectorSpec

    constructor(spec: I.ConnectorSpec){
        super(spec)
    }

    attach(anchor: I.CellAnchor, label:string){
        super.attach(anchor, label)

        if(!(this.cache.medium in anchor.mesh.media)){

            anchor.mesh.addMedium(this.cache.medium, this.domain.recover({
                basis:'media:'+this.cache.medium,
                label:this.cache.medium,
                exposed:this.nucleus
            }))

        }

        anchor.mesh.addRule(this.cache.rule, this.cache.medium, label)
    }

    detach(anchor:I.CellAnchor, label:string){
        anchor.mesh.removeRule(this.cache.medium, label)
    }

}
