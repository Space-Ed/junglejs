import {RuleMesh} from "../../interoperability/mesh/ruleMesh";
import {Membrane} from "../../interoperability/membranes/membrane";
import {BaseMedium} from "../../interoperability/media/medium";
import {Core} from "../../jungle";

export interface MeshInitialiser {
    membrane:Membrane
    rules:any
    exposed:any
}

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

}
