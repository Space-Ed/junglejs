
import * as I from '../interfaces'
import {Designator} from '../../util/designator'

import {Visor} from './visor'
import {BasicContact} from '../contacts/base'

export enum MembraneEvents {
    AddContact, AddMembrane, RemoveContact, RemoveMembrane
}

interface Watchable<Watcher> {
    addWatch(watcher:Watcher, alias?:string);
}

interface SectionWatcher {
    designator?:Designator;
    changeOccurred(event:MembraneEvents, subject:BasicContact<any>|Section, token:string):void
}

export function DemuxWatchMethodsF(target:I.MembraneWatcher){
    return  (event:MembraneEvents, data, token)=>{
        switch(event){
            case(MembraneEvents.AddContact):target.onAddContact(<I.Contact>data, token);break;
            case(MembraneEvents.RemoveContact):target.onRemoveContact(<I.Contact>data, token);break;
            case(MembraneEvents.AddMembrane):target.onAddMembrane(<Membrane>data, token);break;
            case(MembraneEvents.RemoveMembrane):target.onRemoveMembrane(<Membrane>data, token);break;
        }
    }

}

export class Section implements Watchable<SectionWatcher>, SectionWatcher{

    designator:Designator;
    watches:SectionWatcher[]
    sections:Section[]
    source:Membrane;

    constructor(){
        this.sections = [];
        this.watches = [];
    }

    addSection(desexp:string, alias?:string):Section{
        let section = new Section();

        if(this instanceof Membrane){
            section.source = this;
        }else{
            section.source = this.source;
        }

        Object.defineProperty(section, 'subranes',{
            get(){
                return this.source.subranes
            }
        })

        Object.defineProperty(section, 'contacts',{
            get(){
                return this.source.contacts
            }
        })

        section.designator = new Designator('subranes', 'contacts', desexp);

        if(alias === undefined){
            this.sections.push(section)
        }else{
            this.sections[alias]= section
        }

        return section
    }

    designate(dexp:string, flat=false){
        let desig = new Designator('subranes','contacts', dexp);

        for(let ik in this.sections){
            desig.screen(this.sections[ik].designator.expression)
        }

        return desig.scan(this, flat)
    }


    addWatch(watcher:SectionWatcher, alias?:string){
        if(alias === undefined){
            this.watches.push(watcher)
        }else{
            this.watches[alias]= watcher
        }
    }

    removeWatch(key){
        delete this.watches[key]
    }

    removeAllWatches(){
        this.watches = [];
    }

    protected nextToken(token, key){

        if(isNaN(key)){
            if(token === undefined){ //membrane inception
                return key
            }else if (token.match(/^\:\w+$/)){//contact inception
                return `${key}${token}`
            } else { //membrane continutation
                return `${key}.${token}`
            }
        }else{ //anonymous watch
            return token  || ""
        }

    }

    changeOccurred(event:MembraneEvents, subject:BasicContact<any>|Section, token?:string){
        for (let skey in this.sections){
            let section = this.sections[skey];
            if(section.designator === undefined || section.designator.matches(token)){

                console.log(`section.designator: ${section.designator.regex.source}  matches (token):${token}`)
                section.changeOccurred(event, subject, this.nextToken(token, skey))
                return //escaped
            }
        }

        //when not
        for(let wKey in this.watches){
            let watch = this.watches[wKey];

            if(watch.designator === undefined || watch.designator.matches(token)){
                watch.changeOccurred(event, subject, this.nextToken(token, wKey))
            }
        }
    }

}

export class Membrane extends Section{

    contacts:any;
    subranes:any;

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
                let contact:BasicContact<any> = this.contacts[rk]

                if(contact.invertable){
                    this.inverted.addContact(rk, contact.invert())
                }

            }

        }

        return this.inverted
    }

    // getMembraneToken(){
    //     if(this.parent==undefined){
    //         return "";
    //     }else{
    //         let parentToken =this.parent.getMembraneToken()
    //         if(parentToken){
    //             return +'.'+this.alias;
    //         }else{
    //             return this.alias;
    //         }
    //     }
    // }

    addSubrane(membrane:Membrane, label:string){
        this.subranes[label] = membrane;

        membrane.addWatch(this, label); //watch for changes in the subrane
        this.notifyMembraneAdd(membrane, label);

        //after the membrane all contacts added must be registered downstream
        let allNew = membrane.designate("**:*", false);
        for(let token in allNew){
            //emulated from upstream
            this.changeOccurred(MembraneEvents.AddContact, allNew[token], this.nextToken(token,label))
        }
    }

    removeSubrane(label):Membrane{
        let removing = this.subranes[label];
        delete this.subranes[label];

        //before the membrane all contacts being removed must be registered downstream
        let allNew = removing.designate("**:*", false);
        for(let token in allNew){
            //emulated from upstream
            this.changeOccurred(MembraneEvents.RemoveContact, allNew[token], this.nextToken(token,label))
        }

        this.notifyMembraneRemove(removing, label)

        return removing
        }

    addContact(label:string, contact:BasicContact<any>){
        let existing:BasicContact<any> = this.contacts[label];
        if(existing !== undefined){

        }else{

            contact.attach(this, label)
            this.contacts[label] = contact

            let invertContact
            if(this.inverted !== undefined && (invertContact = contact.invert())){
                this.inverted.addContact(label, invertContact)
            }

            this.notifyContactAdd(contact, label)
        }
    }

    removeContact(label:string):BasicContact<any>{

        let removing:BasicContact<any> = this.contacts[label];

        if(removing !== undefined){
            removing.detach();
            delete this.contacts[label];

            if(this.inverted && removing.invertable){
                this.inverted.removeContact(label);
            }

            this.notifyContactRemove(removing, label)
        }

        return removing
    }

    //Primary Change EntryPoints

    notifyContactAdd(contact:BasicContact<any>, label){
        if(this.notify){
            this.changeOccurred(MembraneEvents.AddContact, contact, ":"+label)
        }
    }

    notifyContactRemove(contact:BasicContact<any>, label){
        if(this.notify){
            this.changeOccurred(MembraneEvents.RemoveContact, contact, ":"+label)
        }
    }

    notifyMembraneAdd(membrane, token?){
        if(this.notify){
            this.changeOccurred(MembraneEvents.AddMembrane, membrane, token)
        }
    }

    notifyMembraneRemove(membrane, token?){
        if(this.notify){
            this.changeOccurred(MembraneEvents.RemoveMembrane, membrane, token)
        }
    }
}
