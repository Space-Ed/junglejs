import * as Jungle from '../../jungle'

import Jasmine = require('jasmine')

let {Membrane, DemuxWatchMethodsF, Op} = Jungle.IO;

import {Input, Output, Duplex} from './testContacts'

export default class TestHost {
    changeOccurred;
    primary:Jungle.Membrane;
    invert:Jungle.Membrane;

    addspy:jasmine.Spy
    remspy:jasmine.Spy
    membaddspy:jasmine.Spy
    membremspy:jasmine.Spy

    inputs:any
    outputs:any

    constructor(labels){

        this.changeOccurred = DemuxWatchMethodsF(this)
        this.primary = new Membrane()
        this.primary.addWatch(this)
        this.invert = this.primary.invert()

        this.addspy = jasmine.createSpy("add contact")
        this.remspy = jasmine.createSpy("remove contact")
        this.membaddspy = jasmine.createSpy("add membrane")
        this.membremspy = jasmine.createSpy("remove membrane")

        this.inputs = {}
        this.outputs = {}

        this.populate(labels)

    }

    onAddContact(crux, token){
        this.addspy(crux, token)
    }

    onRemoveContact(crux,token){
        this.remspy(crux,  token)
    }

    onAddMembrane(membrane, token){
        this.membaddspy(membrane, token)
    }

    onRemoveMembrane(membrane, token){
        this.membremspy(membrane, token)
    }

    retrieveContext(port){
        return this
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
