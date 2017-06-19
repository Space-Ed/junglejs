import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {CellAccessory} from '../hooks/accessory'

/*

*/
export class Cell extends CS.Composite {

    shell:IO.Membrane;
    protected lining:IO.Membrane;

    mesh:IO.RuleMesh;

    nucleus:any;
    anchor:I.CellAnchor;
    key:string;

    constructor(spec:any){
        //overridable
        spec.domain = spec.domain || CS.JungleDomain
        spec.basis = 'Cell'
        super(spec)

        this.nucleus = {};

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
    }

    /*
        setup the parts of the cell that are contingent on specialisation
    */
    applyForm(form:any={}){

        let rules = form.mesh || {}
        //the internal interlinking mechanism, contingent upon which rules are added as neccessary to the cell
        this.mesh = new IO.RuleMesh({
            membrane:this.lining,
            rules:rules,
            exposed:this.nucleus
        })

        //the anchor is provided to constructs at attach time, it is contingent on accessibility restraint
        this.anchor = {
            nucleus:this.nucleus,
            lining:this.lining,
            mesh:this.mesh
        }

        //the creation of sections for exclusive grouping of internal contacts to be exposed on shell or injected to context

        if(form.sections !== undefined){
            for(let sectionkey in form.sections){
                this.parseSectionRule(form.sections[sectionkey])
            }

        }
    }

    /*
        undo the setup so that a new form can be applied
    */
    clearForm(){
        //everything recreated is sufficient
    }

    parseSectionRule(rule:string){
        let match = rule.match(/^([\w\:\.\*]*)\s*to\s*(nucleus|shell)\s*(?:as\s*(\w*))?$/)
        if(match){
            //console.log(match)
            let desexp = match[1]
            let target = match[2]
            let alias = match[3]

            let sect = this.lining.addSection(desexp)

            if(target === 'shell'){
                this.shell.addSubrane(sect, alias)
            }else if(target === 'nucleus'){
                if(alias !== undefined){
                    this.nucleus[alias] = {};
                }

                //should be nucleus
                sect.addWatch({
                    changeOccurred:(event:IO.MembraneEvents, subject:IO.BasicContact<any>|IO.Section, token:string)=>{
                        if(event == IO.MembraneEvents.AddContact){
                            let injectsite = alias === undefined ? this.nucleus : this.nucleus[alias];

                            (<IO.BasicContact<any>>subject).inject(injectsite, token)

                            //console.log(`detect injection on token ${token} with alias ${alias}`);

                        }
                    }
                })
            }
        }else{
            throw `Invalid section expression: ${rule}`
        }
    }

    attach(anchor:I.CellAnchor, alias){
        anchor.lining.addSubrane(this.shell, alias)
    }

    detach(anchor:I.CellAnchor, alias){
        anchor.lining.removeSubrane(alias)
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

}

CS.JungleDomain.register('Cell', Cell, {
    form:{
        sections:[],
        mesh:{}
    }
})
