import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {meld} from "../../util/ogebra/operations";

/*

*/
export class Cell extends CS.Composite implements I.CellAnchor{

    host:Cell;
    shell:IO.Membrane;
    lining:IO.Membrane;
    mesh:IO.RuleMesh;
    forward:IO.Section;

    constructor(domain?:CS.Domain){
        super(domain)

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();

        //the internal interlinking mechanism
        this.mesh = new IO.RuleMesh(this.lining)

    }

    /*
        setup the parts of the cell that are contingent on specialisation
    */
    applyHead(head:any={}){
        //creates state, pool and tractors from head
        super.applyHead(head)

        if(head.forward){
            this.forward=this.shell.createSection(head.forward)
        }
      
    }

    /*
        undo the setup so that a new head can be applied
    */
    clearHead(){
        // this.remove('heart')

        // super.clearHead()
        //everything recreated is sufficient
    }


    attach(anchor:Cell, alias){
        super.attach(anchor, alias)
        anchor.lining.addSubrane(this.shell, alias)

        if(this.forward){
            anchor.shell.addSubrane(this.forward, alias)
        }
    }

    detach(anchor:Cell, alias){
        super.detach(anchor, alias)
        anchor.lining.removeSubrane(alias)

        if(this.forward){
            anchor.shell.removeSubrane(alias)
        }
    }

    scan(designator:string){
        return this.shell.designate(designator)
    }

    seek(designator:string){
        let all = this.scan(designator)
        return all[Object.keys(all)[0]]
    }
}
