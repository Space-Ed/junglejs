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

                let {constructorF, args, name } = mediumBasis
                let medium = new constructorF(args)
                this.addMedium(name, medium)
            }
        }else if(init.media instanceof Object){
            for (let mediumBasis in init.media){
                let { constructorF, args} = init.media[mediumBasis]
                let medium = new constructorF(args)
                this.addMedium(mediumBasis, medium)
            }
        }

        for(let lawmedium in init.laws||{}){
            for (let law of init.laws[lawmedium]){
                this.addRule(law, lawmedium)
            }
        }

    }

}
