import { Construct } from '../../construction/construct'
import * as I from '../interfaces'
import { LinkRule } from '../../interoperability/interfaces'
import {ensureArray}  from '../../util/transforms'
import {parseLawExpression, LawIR} from '../../interoperability/law'

export class MediumConstruct extends Construct {

    handles:any[]

    attach(anchor: I.CellAnchor, label: string) {
        super.attach(anchor, label)

        this.handles = [];
        let medium = this.head.medium
        let args = this.nucleus

        let _medium = new medium(args)
        
        this.handleMedium(anchor.mesh.addMedium(label, _medium))
        
        for(let lawexp of ensureArray(this.nucleus.law)){
            let laws:LawIR[] = parseLawExpression(lawexp, label)

            for(let law of laws){
                let handle = anchor.mesh.addLaw(law)
                //this.handleLaw()
            }
        }

    }

    handleLaw(handle){
        this.handles.push(handle)
        handle.on
    }

    handleMedium(handle){

        this.handles.push(handle)
        //take responsib
    }

    handleConflict(conflict){

        //FUTURE: send conflicts to construct health
        // this.health.inflict(conflict)

        this.dispose()

    }

    detach(anchor: I.CellAnchor, label: string) {
        // anchor.mesh.removeMedium(this.nucleus, label)

        for (let h of this.handles){
            h.dissolve()
        }
    }

}

