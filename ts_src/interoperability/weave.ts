import {LawIR} from './law'
import {Medium} from './interfaces'
import {Membrane} from './membranes/membrane'

export class Weave {

    laws:Law[]
    media:{[name:string]:Medium}

    constructor(target:Membrane){

    }

    addLaw(exp:lawIR){

    }

    private formulate(lawIR){

    }

    addMedium(name:string, medium:Medium){
        this.media[name] = medium;
    }

    onAddContact(){

    }

    onRemoveContact

    onAddMembrane

    onRemoveMembrane

    private activeLaws(){

    }

    private pendingLaws():


    private activeMedia()

    private pendingMedia
}