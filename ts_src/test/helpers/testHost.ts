import * as Jungle from '../../jungle'
let {Membrane} = Jungle;

import {Input, Output, Duplex} from './testContacts'

export default class TestHost {
    contactChange;
    primary:Jungle.Membrane;
    invert:Jungle.Membrane;

    addspy:jasmine.Spy
    remspy:jasmine.Spy
    membaddspy:jasmine.Spy
    membremspy:jasmine.Spy

    inputs:any
    outputs:any

    constructor(labels){

        this.contactChange = (token, contact)=>{
            if (contact){
                this.addspy(token, contact)
            }else{
                this.remspy(token)
            }
        }

        this.primary = new Membrane()
        this.primary.addWatch(this)
        this.invert = this.primary.invert()

        this.addspy = jasmine.createSpy("add contact")
        this.remspy = jasmine.createSpy("remove contact")

        this.inputs = {}
        this.outputs = {}

        this.populate(labels)

    }

    /**
     * Parse the standard IO name format _sinkname sourcename_ and plant them respectively
     */
    populate(labels){
        var validPortRegex = /^([_\$]?)([a-zA-Z](?:\w*[a-zA-Z])?)([_\$]?)$/
        for (let i = 0; i < labels.length; i++) {
            let pmatch = labels[i].match(validPortRegex);

            if(pmatch){
                let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                if(inp == '_' && out == '_'){

                    let add = Duplex()

                    this.primary.addContact(add, label)
                    this.inputs[label] = (<any>add).partner
                    this.outputs[label] =(<any>add).partner

                }else if(inp == '_'){
                    let add = Input()
                    this.primary.addContact(add, label)
                    this.inputs[label] = (<any>add).partner

                }else if (out == '_'){
                    let add = Output()
                    this.primary.addContact(add, label)
                    this.outputs[label] = (<any>add).partner

                }

            }else{
                throw new Error(`Invalid port label ${labels[i]}, must be _<sink label> (leading underscore) or <source label>_ (trailing underscore)`)
            }
        }
    }
}
