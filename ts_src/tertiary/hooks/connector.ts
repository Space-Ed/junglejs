
import {Construct} from '../../construction/construct'
import * as I from '../interfaces'
import {LinkRule} from '../../interoperability/interfaces'

export class Connector extends Construct {

    nucleus:I.ConnectorSpec

    attach(anchor: I.CellAnchor, label:string){
        super.attach(anchor, label)

        if(!(this.nucleus.medium in anchor.mesh.media)){

            anchor.mesh.addMedium(this.nucleus.medium, this.domain.recover({
                basis:'media:'+this.nucleus.medium,
                label:this.nucleus.medium,
                exposed:this.nucleus
            }))

        }

        anchor.mesh.addRule(this.nucleus.rule, this.nucleus.medium, label)
    }

    detach(anchor:I.CellAnchor, label:string){
        anchor.mesh.removeRule(this.nucleus.medium, label)
    }

}
