
import {Construct} from '../../construction/construct'
import * as I from '../interfaces'
import {parseLawExpression, Law} from '../../interoperability/law'


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

            let actual = new Law(law);
            anchor.weave.addLaw(actual)
            this.handles.push(actual)
        }
    }

    detach(anchor:I.CellAnchor, label:string){
        for(let handle of this.handles){
            anchor.weave.removeLaw(handle)
        }
    }

}
