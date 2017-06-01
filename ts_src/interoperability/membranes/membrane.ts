
import * as I from '../interfaces'
import {BasicDesignable} from './designable'

import {Visor} from './visor'
import {BasicContact} from '../contacts/base'

export class Membrane extends BasicDesignable {

    terminals:any;
    subgroups:any;

    inverted:Membrane;
    parent:Membrane;
    alias:string;
    notify:boolean;
    watcher:I.MembraneWatcher;

    constructor (){
        super("subgroups", "terminals")
        this.terminals = {};
        this.subgroups = {};
        this.notify = true;
    }

    watch(watcher:I.MembraneWatcher){
        this.watcher = watcher
    }

    notifyContactAdd(label, contact:BasicContact<any>, token?){
        if(this.notify){

            let basic = token==undefined;
            let t = basic?`:${label}`:token;

            if(this.watcher){
                this.watcher.onAddContact(contact, t)
            }

            if(this.parent){
                let qualified = `${this.alias}${basic?t:'.'+token}`
                this.parent.notifyContactAdd(label, contact, qualified)
            }
        }
    }

    notifyContactRemove(label, contact:BasicContact<any>, token?){
        if(this.notify){
            let basic = token==undefined;
            let t = basic?`:${label}`:token;

            if(this.watcher){
                this.watcher.onRemoveContact(contact,t)
            }

            if(this.parent){
                let qualified = `${this.alias}${basic?t:'.'+token}`
                this.parent.notifyContactRemove(label, contact, qualified)
            }
        }
    }

    notifyMembraneAdd(membrane, token?){
        if(this.notify){
            let basic = token==undefined;
            let t = basic?`${membrane.alias}`:token;
            this.watcher.onAddMembrane(membrane, t)

            if(this.parent){
                let qualified = `${this.alias}${basic?t:'.'+token}`
                this.parent.notifyMembraneAdd(membrane, qualified)
            }
        }
    }

    notifyMembraneRemove(membrane, token?){
        if(this.notify){
            let basic = token==undefined;
            let t = basic?`${membrane.alias}`:token;
            this.watcher.onRemoveMembrane(membrane, t)

            if(this.parent){
                let qualified = `${this.alias}${basic?t:'.'+token}`
                this.parent.notifyMembraneRemove(membrane, qualified)
            }
        }
    }

    invert(){
        if(this.inverted === undefined){

            this.inverted = new Membrane()
            this.inverted.inverted = this;

            for(let rk in this.terminals){
                let contact:BasicContact<any> = this.terminals[rk]

                if(contact.invertable){
                    this.inverted.addContact(rk, contact.invert())
                }

            }

        }

        return this.inverted
    }

    getMembraneToken(){
        if(this.parent==undefined){
            return "";
        }else{
            let parentToken =this.parent.getMembraneToken()
            if(parentToken){
                return +'.'+this.alias;
            }else{
                return this.alias;
            }
        }
    }

    // createVisor(designation:string|string[], host){
    //
    //     let visor =  new Visor(this, host);
    //     this.visors.push(visor)
    // }

    addSubrane(membrane:Membrane, label:string){
        this.subgroups[label] = membrane;
        membrane.parent = this;
        membrane.alias = label;

        this.notifyMembraneAdd(membrane);
    }

    removeSubrane(label):Membrane{
        let removing = this.subgroups[label];
        delete this.subgroups[label];

        this.notifyMembraneRemove(removing)

        removing.parent = undefined;
        removing.alias = undefined;

        return removing
        }

    addContact(label:string, contact:BasicContact<any>){
        let existing:BasicContact<any> = this.terminals[label];
        if(existing !== undefined){

        }else{

            contact.attach(this, label)
            this.terminals[label] = contact

            let invertContact
            if(this.inverted !== undefined && (invertContact = contact.invert())){
                this.inverted.addContact(label, invertContact)
            }

            this.notifyContactAdd(label, contact)
        }
    }

    removeContact(label:string){

        let existing:BasicContact<any> = this.terminals[label];

        if(existing !== undefined){
            existing.detach();
            delete this.terminals[label];

            if(this.inverted && existing.invertable){
                this.inverted.removeContact(label);
            }

            this.notifyContactRemove(label, existing)
        }
    }


}
