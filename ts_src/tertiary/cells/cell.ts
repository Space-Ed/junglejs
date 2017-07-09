import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {CellAccessory} from '../hooks/accessory'

/*

*/
export class Cell extends CS.Composite implements I.CellAnchor{

    shell:IO.Membrane;
    lining:IO.Membrane;
    mesh:IO.RuleMesh;
    nucleus:any;

    constructor(spec:any){
        //overridable
        super(spec)

        this.nucleus = {};

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();
    }

    /*
        setup the parts of the cell that are contingent on specialisation
    */
    applyForm(form:any={}){
        super.applyForm(form)

        //draw the appropriate media from the basis given
        let media = {};
        for (let mediumBasis of form.media||[]){
            media[mediumBasis] = this.domain.recover({
                basis:'media:'+mediumBasis,
                label:mediumBasis,
                exposed:this.nucleus
            })
        }

        let rules = form.mesh || {}
        //the internal interlinking mechanism, contingent upon which rules are added as neccessary to the cell
        this.mesh = new IO.RuleMesh({
            membrane:this.lining,
            rules:rules,
            media:media,
            exposed:this.nucleus
        })

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

}
