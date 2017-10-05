import {Cell} from './cell'
import* as I from '../interfaces'

export class ObjectCell extends Cell {

    applyHead(head:any={}){
        head.exposure = 'public'
        head.forward = '**:*'

        super.applyHead(head);
    }

}
