import {RuleMesh} from "../../interoperability/mesh/ruleMesh";
import {Membrane} from "../../interoperability/membranes/membrane";
import {BaseMedium} from "../../interoperability/media/medium";
import {Core} from "../../jungle";

export interface MeshInitialiser {
    membrane:Membrane
    rules:any
    exposed:any
}

/**
 * Allows the use of jungle-core domain media types by the native means of recovery
 */
export default class MeshAdapter extends RuleMesh {

    constructor(init:MeshInitialiser){
        super({
            membrane:init.membrane,
            media:{},
            rules:{},
            exposed:init.exposed
        })

        for (let mediakey in init.rules){
            //Check there is an over creation of
            let newMedium = Core.recover({
                basis:'media:'+mediakey,
                label:mediakey,
                exposed:this.exposed
            })

            this.addMedium(mediakey, newMedium)
            this.parseRules(init.rules[mediakey], mediakey);
        }

    }

    hasLinked(tokenA, tokenB, directed=true){
        let mediaWithA = this.locations[tokenA]

        for(let mediakey in mediaWithA){
            let medium:BaseMedium<any,any> = this.media[mediakey]
            let aToMap =  medium.matrix.to[tokenA]
            let aSymMap = medium.matrix.sym[tokenA]

            if(directed && aToMap !== undefined &&  aToMap[tokenB] !== undefined){
                return true
            }else if(!directed  && aSymMap !== undefined &&  aSymMap[tokenB] !== undefined){
                return true
            }
        }

        return false
    }

}
