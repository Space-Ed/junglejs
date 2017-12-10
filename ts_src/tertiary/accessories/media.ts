import { Construct } from '../../construction/construct'
import {ensureArray}  from '../../util/checks'
import {parseLawExpression, LawIR, Law} from '../../interoperability/law'
import {Cell} from '../cells/cell'
import { BaseMedium } from '../../interoperability/media/base';

export class MediumConstruct extends Construct {

    lawhandles:any[]
    mhandle:any
    medium:BaseMedium<any,any>

    attach(anchor: Cell, label: string) {
        super.attach(anchor, label)

        this.lawhandles = [];
        let medium = this.head.medium
        let args = this.nucleus

        this.medium = new medium(args)
        
        let mhandle = anchor.weave.addMedium(this.medium, label)
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

    detach(anchor: Cell, label: string) {
        // anchor.mesh.removeMedium(this.nucleus, label)

        // for (let h of this.lawhandles){
        //     h.retract()
        // }

        // this.mhandle.retract()
    }

}

