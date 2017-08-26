import {Cell} from './cell'
import* as I from '../interfaces'

export class DefaultCell extends Cell {

    applyForm(form:any={}){
        form.exposure = 'public'
        form.forward = '**:*'

        super.applyForm(form);
    }

}
