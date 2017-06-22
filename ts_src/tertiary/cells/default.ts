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

        //accessors of immediate children
        this.parseSectionRule('*:access to nucleus')

        //all base level contacts are injected
        //this.parseSectionRule(':* to nucleus')

        //all other contacts are forwarded
        this.parseSectionRule('*.**:* to shell')

        // this contact will be exposed and also injected
        this.offering = new OfferContact(form.accessPolicy);
        this.accessor = this.offering.invert()

        //allow the whole nucleus to be accessed
        this.offering.inject(this, 'nucleus')

        //adding hidden contact to reveal accessor on the opposite side
        this.lining.addContact( this.offering, 'access')
        this.shell.addContact( this.accessor, 'access')
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

        anchor.lining.addSubrane(this.shell, key)
    }

    detach(anchor:I.CellAnchor, key){
        this.accessor.retract(anchor.nucleus, key)

        anchor.lining.removeSubrane(key)
    }
}

JungleDomain.register('object', DefaultCell)
