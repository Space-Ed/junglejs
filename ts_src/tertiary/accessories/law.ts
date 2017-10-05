
import {Construct} from '../../construction/construct'
import * as I from '../interfaces'
import {LinkRule} from '../../interoperability/interfaces'
import {parseLawExpression} from '../../interoperability/law'


export class LawConstruct extends Construct {

    nucleus:string;
    handle:LawHandle;

    attach(anchor: I.CellAnchor, label:string){
        super.attach(anchor, label)

        let lawIRS = parseLawExpression(this.nucleus)

        this.handle = anchor.mesh.addLaw(lawIRS)
    }

    detach(anchor:I.CellAnchor, label:string){
        this.handle.retract()
    }

}
