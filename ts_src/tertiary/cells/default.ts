import {Cell} from './cell'
import* as I from '../interfaces'
import {AccessContact, OfferContact} from '../../interoperability/contacts/access/common'
import {JungleDomain} from "../../construction/domain";

export class DefaultCell extends Cell {

    offering:OfferContact
    accessor:AccessContact

    constructor(object){
        super(object)
    }

    applyForm(form={}){

        //normal basic cell when a form exists
        super.applyForm(form);

        //such that all accessors of children exposed in that way will be
        this.parseSectionRule('*:access to nucleus')

        // this contact will be exposed and also injected
        this.offering = new OfferContact(form.accessPolicy);
        this.accessor = this.offering.invert()

        //allow the whole nucleus to be accessed
        this.offering.inject(this, 'nucleus')

        //adding hidden contact to reveal accessor on the opposite side
        this.lining.addContact('access', this.offering)
        this.shell.addContact('access', this.accessor)
    }

    clearForm(){
        this.offering.retract(this.nucleus, undefined);
        this.lining.removeContact('access')

        super.clearForm();
    }

    attach(anchor:I.CellAnchor, key){
        //injection will be attempted and if not allowed the accessor will still be exposed on the shell
        if(anchor.nucleus){
            this.accessor.inject(anchor.nucleus, key);
        }

        anchor.mesh.addSubrane(this.shell, key)
    }

    detach(anchor:I.CellAnchor, key){
        this.accessor.retract(anchor.nucleus, key)

    }
}

JungleDomain.register('object', DefaultCell)
