
import {Layer} from './layer'
import { TokenIR,  parseDesignatorString, scannerF, tokenize} from '../../util/designation/all'
import {BaseContact} from '../contacts/base'
import * as O from '../../util/ogebra/all'



export class Membrane extends Layer{

    contacts:{[label:string]:BaseContact<any>};
    subranes:{[label:string]:Layer};

    inverted:Membrane;
    notify:boolean;

    constructor (){
        super()
        this.contacts = {};
        this.subranes = {};
        this.notify = true;
    }

    invert(){
        if(this.inverted === undefined){

            this.inverted = new Membrane()
            this.inverted.inverted = this;

            for(let rk in this.contacts){
                let contact:BaseContact<any> = this.contacts[rk]

                if(contact.invertable){
                    this.inverted.addContact( contact.invert(), rk)
                }

            }

        }

        return this.inverted
    }

    scan(desexp: string, flat = true) {
        let desig = scannerF('subranes', 'contacts');
        let scan = desig(parseDesignatorString(desexp), this)
        if (flat) {
            return tokenize(scan)
        } else {
            return scan
        }
    }

    addSubrane(layer:Layer, label:string){
        this.subranes[label] = layer;

        layer.addWatch(this, label); //watch for changes in the subrane
    }

    removeSubrane(label):Layer  {
        let removing = this.subranes[label];
        
        if(removing === undefined){
            return
        }
        
        removing.removeWatch(label)
        delete this.subranes[label];

        return removing
    }

    addContact(contact:BaseContact<any>, label:string){
        let existing:BaseContact<any> = this.contacts[label];
        if(existing !== undefined){
            //no overriding 
        }else{

            this.contacts[label] = contact

            if(this.inverted !== undefined){

                //invert the first and only the first
                if(contact.invertable && !contact.inverted){
                    let partner = contact.invert()
                    this.inverted.addContact( partner, label)

                    if(this.inverted.contacts[label] !== partner){
                    }
                }
            }

            this.notifyContactAdd(contact, label)
        }
    }

    removeContact(label:string):BaseContact<any>{

        let removing:BaseContact<any> = this.contacts[label];

        if(removing !== undefined){
            delete this.contacts[label];

            if(this.inverted && removing.invertable){
                this.inverted.removeContact(label);
            }

            this.notifyContactRemove(removing, label)
        }

        return removing
    }

    //Primary Change EntryPoints

    notifyContactAdd(contact:BaseContact<any>, label){
        if(this.notify){
            this.contactChange([[],label], contact)
        }
    }

    notifyContactRemove(contact:BaseContact<any>, label){
        if (this.notify) {
            this.contactChange([[], label])
        }
    }

}
