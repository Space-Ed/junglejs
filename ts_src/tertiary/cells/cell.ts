import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {CellAccessory} from './accessory'

/*

*/
export class Cell extends CS.Composite {

    mesh:IO.RuleMesh;
    shell:IO.Membrane;

    private lining:IO.Membrane;

    nucleus:any;
    policy:ShellPolicy;

    anchor:I.CellAnchor;
    key:string;

    constructor(spec:any){
        //overridable
        spec.domain = spec.domain || CS.JungleDomain
        spec.basis = 'Cell'
        super(spec)

        this.nucleus = {};

        this.policy = FreePolicy
        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();

        this.mesh = new IO.RuleMesh({
            membrane:this.lining,
            rules:spec.form.mesh,
            exposed:this.nucleus
        })

        this.anchor = {
            nucleus:this.nucleus,
            mesh:this.lining
        }

        for(let sectionkey in spec.form.sections){
            this.parseSectionRule(spec.form.sections[sectionkey])
        }

    }

    parseSectionRule(rule:string){
        let match = rule.match(/^([\w\:\.]*)\s*to\s*(nucleus|shell)\s*as\s*(\w*)$/)
        if(match){
            console.log(match)
            let desexp = match[1]
            let target = match[2]
            let alias = match[3]

            let sect = this.lining.addSection(desexp)
            if(target === 'shell'){
                this.shell.addSubrane(sect, alias)
            }else if(target === 'nucleus'){
                this.nucleus[alias] = {};

                //should be nucleus
                sect.addWatch({
                    changeOccurred:(event:IO.MembraneEvents, subject:IO.BasicContact<any>|IO.Section, token:string)=>{
                        if(event == IO.MembraneEvents.AddContact){
                            (<IO.BasicContact<any>>subject).inject(this.nucleus[alias],token)

                            console.log("detect injection on token", token);

                        }
                    }
                })
            }
        }else{
            throw `Invalid section expression: ${rule}`
        }
    }

    attach(anchor:I.CellAnchor, alias){
        anchor.mesh.addSubrane(this.shell, alias)
    }

    detach(anchor:I.CellAnchor, alias){
        anchor.mesh.removeSubrane(alias)
    }

    addConstruct(k, construct:CS.Construct){
        super.addConstruct(k, construct)
    }

    addStrange(k, v){
        this.nucleus[k] = v;
    }

    addPrimative(k, v){
        this.nucleus[k] = v;
    }

    addObject(k, v){
        let construct = new Cell(v)
        this.addConstruct(k, construct)
    }

    prime(domain:CS.Domain){
        super.prime(domain);
    }

}

CS.JungleDomain.register('Cell', Cell, {
    form:{
        sections:[],
        mesh:{}
    }
})
