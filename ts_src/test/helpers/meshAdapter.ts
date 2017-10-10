import {RuleMesh} from "../../interoperability/mesh/ruleMesh";
import {Membrane} from "../../interoperability/membranes/membrane";
import {BaseMedium} from "../../interoperability/media/medium";
import {J} from "../../jungle";
import {meld} from "../../util/ogebra/operations";
import {MuxMedium, DEMUXARG, MUXRESP, CALLTYPE} from '../../interoperability/media/multiplexing'

export interface MeshInitialiser {
    membrane:Membrane
    media:any,
    laws:any,
    exposed:any
}

const mediaPrepacks = {
    direct :{
        mediumF:MuxMedium,
        args: {
            symbols: [],
            emitArgType: DEMUXARG.ONE,
            emitRetType: MUXRESP.LAST,
            emitCallType: CALLTYPE.DIRECT
        },
        name:'direct'
    },
    
    cast : {
        name:'cast',
        mediumF: MuxMedium,
        args: {
            symbols: [],
            emitArgType: DEMUXARG.ONE,
            emitRetType: MUXRESP.DROP,
            emitCallType: CALLTYPE.BREADTH_FIRST
        }
    }
}

/**
 * Allows the use of jungle-core domain media types by the native means of recovery
 */
export default class MeshAdapter extends RuleMesh {

    constructor(init:MeshInitialiser){
        super(init.membrane)

        if(init.media instanceof Array){
            for (let mediumBasis of init.media||[]){

                let { mediumF, args, name } = mediaPrepacks[mediumBasis]
                let medium = new mediumF(args)
                this.addMedium(name, medium)
            }
        }else if(init.media instanceof Object){
            for (let mediumBasis in init.media){
                let { mediumF, args } = mediaPrepacks[init.media[mediumBasis]]
                let medium = new mediumF(args)
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
