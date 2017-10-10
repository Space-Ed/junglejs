
import {Construct} from '../../construction/construct'
import * as I from '../interfaces'
import {LinkRule} from '../../interoperability/interfaces'
import {parseLawExpression} from '../../interoperability/law'


export class LawConstruct extends Construct {

    nucleus:string;
    handles:any;

    attach(anchor: I.CellAnchor, label:string){
        super.attach(anchor, label)

        this.handles = []

        let lawIRS = parseLawExpression(this.nucleus)

        
        for (let i = 0; i<lawIRS.length; i++){
            let law = lawIRS[i]
            law.key = label+i
            this.handles.push(anchor.mesh.addLaw(law))
        }
    }

    detach(anchor:I.CellAnchor, label:string){
        for(let handle of this.handles){
            handle.retract()
        }
    }

}
