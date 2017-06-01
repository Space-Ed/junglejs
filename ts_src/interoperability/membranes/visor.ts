import {BasicDesignable} from '../membranes/designable'

export class Visor extends BasicDesignable{

    roles:any;
    subranes:any;

    constructor(private target:BasicDesignable, designator){
        super('subranes', 'roles')

    }

}
