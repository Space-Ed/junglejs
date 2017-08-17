import {Cell} from './cell'
import* as I from '../interfaces'
import {AccessContact, OfferContact} from '../../interoperability/contacts/access/common'

export class DefaultCell extends Cell {

    applyForm(form:any={}){
        form.exposure = 'public'
        form.forward = '**:*'

        super.applyForm(form);
    }

}
