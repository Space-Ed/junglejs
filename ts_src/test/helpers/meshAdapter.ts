import {RuleMesh} from "../../interoperability/mesh/ruleMesh";
import {Membrane} from "../../interoperability/membranes/membrane";
import {BaseMedium} from "../../interoperability/media/medium";
import {Core} from "../../jungle";
import {meld} from "../../util/ogebra/operations";

export interface MeshInitialiser {
    membrane:Membrane
    media:any,
    laws:any,
    exposed:any
}

/**
 * Allows the use of jungle-core domain media types by the native means of recovery
 */
export default class MeshAdapter extends RuleMesh {

    constructor(init:MeshInitialiser){
        super(init.membrane)

        if(init.media instanceof Array){
            for (let mediumBasis of init.media||[]){
                this.addMedium(mediumBasis, Core.recover({
                    basis:'media:'+mediumBasis,
                    label:mediumBasis,
                    exposed:init.exposed
                }))
            }
        }else if(init.media instanceof Object){
            for (let mediumBasis in init.media){
                this.addMedium(mediumBasis, Core.recover(meld((a, b)=>{return b})({
                    basis:'media:'+mediumBasis,
                    label:mediumBasis,
                    exposed:init.exposed
                },init.media[mediumBasis])))
            }
        }

        for(let lawmedium in init.laws||{}){
            for (let law of init.laws[lawmedium]){
                this.addRule(law, lawmedium)
            }
        }

    }

}
