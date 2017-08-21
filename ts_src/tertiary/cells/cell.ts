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
        //overridable
        super(domain)

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
    }

    /*
        setup the parts of the cell that are contingent on specialisation
    */
    applyForm(form:any={}){
        super.applyForm(form)

        if(form.forward){
            this.forward=this.shell.createSection(form.forward)
        }

        //the internal interlinking mechanism
        this.mesh = new IO.RuleMesh(this.lining)

        if(form.media instanceof Array){
            for (let mediumBasis of form.media||[]){
                this.mesh.addMedium(mediumBasis, this.domain.recover({
                    basis:'media:'+mediumBasis,
                    label:mediumBasis,
                    exposed:this.local
                }))
            }
        }else if(form.media instanceof Object){
            for (let mediumBasis in form.media){
                this.mesh.addMedium(mediumBasis, this.domain.recover(meld((a, b)=>{return b})({
                    basis:'media:'+mediumBasis,
                    label:mediumBasis,
                    exposed:this.local
                },form.media[mediumBasis])))
            }
        }

        for(let lawmedium in form.laws||{}){
            for (let law of form.laws[lawmedium]){
                this.mesh.addRule(law, lawmedium)
            }
        }
    }

    /*
        undo the setup so that a new form can be applied
    */
    clearForm(){
        //everything recreated is sufficient
    }


    attach(anchor:Cell, alias){
        super.attach(anchor, alias)
        this.host.lining.addSubrane(this.shell, alias)

        if(this.forward){
            this.host.shell.addSubrane(this.forward, alias)
        }
    }

    detach(anchor:Cell, alias){
        super.detach(anchor, alias)
        anchor.lining.removeSubrane(alias)

        if(this.forward){
            anchor.shell.removeSubrane(alias)
        }
    }
}
