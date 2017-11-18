
import * as Law from './law'
import * as Media from './media/base'
import {Layer} from './membranes/layer'
import {BaseContact} from './contacts/base'


export interface WeaveSpec {
    target: Layer
}

export interface Violable {

}

/**
 *  when laws and media do not match up, a violation will be created that can remedy the situation automatically when the appropriate actions are taken
 * 
 * Media does not exist
*/
export interface Violation {
    cause: Violable[],
    reason: string, 
}

//a context for the coexistence of laws and media. 
export class Weave {
    
    layer:Layer;
    media:{[key:string]:Media.BaseMedium<any,any>}
    laws: {[key:string]:Set<Law.Law>}

    violated: Violation[]

    claims:Map<Media.BaseMedium<any,any>, BaseContact<any>>

    constructor(spec:WeaveSpec){
        this.layer = spec.target;
        this.claims = new Map()
        this.violated = [];
        this.media = {};
        this.laws = {};
    }

    /**
     * Add a law to the situation connecting to appropriate medium
     *  that will create a section for either side which will adapt to changes in the targeted layer
     * when there are no appropriate media create a violation pending the addition 
     * 
     */
    addLaw(law:Law.Law){
        let laws = this.laws[law.spec.medium] = this.laws[law.spec.medium]||new Set()
        laws.add(law)

        let targetMedium = this.media[law.spec.medium]
        if(targetMedium){ 
            law.engage(this.layer, targetMedium)
        }
    }

    removeLaw(law:Law.Law){
        let laws = this.laws[law.spec.medium]
        law.disengage()
        laws.delete(law)
    }

    /**
     * Add a medium to the situation, that will adopt laws that are appropriate to it. 
     * the medium could create a violation by attempting to claim against a claimed contact.
     */
    addMedium(medium, key){
        this.media[key] = medium

        if (this.laws[key]){
            for (let law of this.laws[key]){
                law.engage(this.layer, medium)
            }
        }
    }   

    
    removeMedium(key){
        let rm = this.media[key]

        for (let law of this.laws[key]) {
            law.disengage()
        }

        delete this.media[key]
    }

    /**
     * Inspect the current situation, assessing for validity, where
     */
    status(){

    }

    arrangeDispute(){

    }


}