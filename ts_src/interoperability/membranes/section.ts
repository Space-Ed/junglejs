
/// <reference path="./layer.ts" />

import {Layer} from './layer'
import * as D from '../../util/designation/all'
import {BaseContact} from '../contacts/base'

//a section is derived from a layer and represents a designation virtual
export class Section extends Layer {

    designator: D.DesignatorIR;
    sources: Layer[];

    contacts: { [label: string]: BaseContact<any> };
    subranes: { [label: string]: Layer };

    constructor(private positive: boolean, private expression: string) {
        super()

        //the designator is used to select which of the source tree
        this.designator = D.parseDesignatorString(expression)
        this.contacts = {}
        this.subranes = {}

    }

    onAddContact(contact, token: D.TokenIR) {

        //ADD THIS CONTACT TO THE VIRTUAL COLLECTION
        let [groups, end] = token
        let loc: any = this

        for (let g of groups) {
            if (!(g in loc.subranes)) {

                loc.subranes[g] = { subranes: {}, contacts: {} }
            }

            loc = loc.subranes[g]
        }

        loc.contacts[end] = contact
    }

    onRemoveContact(token: D.TokenIR) {
        let [groups, end] = token

        let loc: any = this
        for (let g of groups) {
            loc = loc.subranes[g]
        }

        delete loc.contacts[end]

    }

    scan(dexp: string, flat = true) {
        //form a designator and scan the virtualized section representaion
        let desig = D.scannerF('subranes', 'contacts');
        let scan = desig(D.parseDesignatorString(dexp), this)

        if (flat) {
            return D.tokenize(scan)
        } else {
            return scan
        }
    }

    contactChange(token: D.TokenIR, contact?: BaseContact<any>) {
        let m = D.matches(this.designator, token)

        if (m) {
            m = D.compileToken(token) in m;
        }

        if (!m === !this.positive) {


            //update virtualization
            if (contact) {
                this.onAddContact(contact, token)
            } else {
                this.onRemoveContact(token)
            }

            //notify all downstream of the change
            super.contactChange(token, contact)
        }


    }


}
