import { Construct } from '../../construction/construct'
import * as I from '../interfaces'
import {ensureArray}  from '../../util/transforms'
import {parseLawExpression, LawIR, Law} from '../../interoperability/law'

export class MediumConstruct extends Construct {

    lawhandles:any[]
    mhandle:any

    attach(anchor: I.CellAnchor, label: string) {
        super.attach(anchor, label)

        this.lawhandles = [];
        let medium = this.head.medium
        let args = this.nucleus

        let _medium = new medium(args)
        
        let mhandle = anchor.weave.addMedium(_medium, label)
        this.handleMedium(mhandle)
        
        for(let lawexp of ensureArray(this.nucleus.law)){
            let laws:LawIR[] = parseLawExpression(lawexp, label)

            for(let law of laws){
                let handle = anchor.weave.addLaw(new Law(law))
                //this.handleLaw()
            }
        }

    }

    handleLaw(handle){
        this.lawhandles.push(handle)
        handle.on
    }

    handleMedium(handle){

        //take responsibe
    }

    handleConflict(conflict){

        //FUTURE: send conflicts to construct health
        // this.health.inflict(conflict)

        this.dispose()

    }

    detach(anchor: I.CellAnchor, label: string) {
        // anchor.mesh.removeMedium(this.nucleus, label)

        // for (let h of this.lawhandles){
        //     h.retract()
        // }

        // this.mhandle.retract()
    }

}

