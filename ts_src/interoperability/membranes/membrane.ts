
import * as I from '../interfaces'
import {parseTokenSimple, DesignatorIR, TokenIR, matches, compileToken, parseDesignatorString, scannerF, tokenize} from '../../util/designation/all'
import {BasicContact} from '../contacts/base'
import * as O from '../../util/ogebra/all'


export interface Watchable<Watcher> {
    addWatch(watcher:Watcher, alias?:string);
}

export interface SectionWatcher {
    contactChange (token: TokenIR, thing?: BasicContact<any>):void
}


export class Layer implements Watchable<SectionWatcher>, SectionWatcher{

    watches: SectionWatcher[]

    constructor() {
        this.watches = [];
    }

    createSection(desexp: string, alias?: string, positive=true): Section {
        let section = new Section(positive, desexp);
        this.addWatch(section)
        // section.addSource(this, alias)

        return section
    }

    addWatch(watcher:SectionWatcher, alias?:string|number):symbol|string{

        let sym
        if(alias === undefined){
            sym = Symbol("anon")
            this.watches[sym] = watcher
        }else{
            sym = alias
            this.watches[alias]= watcher
        }

        let all = this.scan('**:*', true)
        for (let token in all){
            let reparse = parseTokenSimple(token);
            let qpath:TokenIR = alias === undefined ? reparse : [[alias+"", ...reparse[0]], reparse[1]]
            
            watcher.contactChange(qpath, all[token])
        }

        return sym
    }
    
    removeWatch(key:symbol|string){
        let watcher = this.watches[key]

        let all = this.scan('**:*', true)
        for (let token in all) {

            let reparse = parseTokenSimple(token);
            let qpath:TokenIR = typeof key !== 'string' ? reparse : [[key+'', ...reparse[0]], reparse[1]]
            watcher.contactChange(qpath)
        }

        delete this.watches[key]
    }
    removeAllWatches(){
        this.watches = [];
    }
    
    nextToken(token:TokenIR, key?:string):TokenIR{
        if(typeof key === 'string'){
            return [[key, ...token[0]], token[1]]
        }else {
            return token
        }
    }

    contactChange(path: TokenIR, thing?: BasicContact<any>){

        //notify all watchers of the change
        for(let wKey of (<any[]>Object.getOwnPropertySymbols(this.watches)).concat(Object.keys(this.watches))){
            let watch = this.watches[wKey];
            watch.contactChange(this.nextToken(path, wKey), thing)
        }
    }

    scan(exp, flat):any {

    }
}

//a section is derived from a layer and represents a designation virtual
export class Section extends Layer {

    designator: DesignatorIR;
    sources:Layer[];

    contacts: { [label: string]: BasicContact<any> };
    subranes: { [label: string]: Layer };

    constructor(private positive: boolean, private expression: string){
        super()

        //the designator is used to select which of the source tree
        this.designator = parseDesignatorString(expression)
        this.contacts = {}
        this.subranes = {}
        
    }

    onAddContact(contact, token:TokenIR) {

        //ADD THIS CONTACT TO THE VIRTUAL COLLECTION
        let [groups, end] = token
        let loc:any = this
        
        for (let g of groups){
            if(!(g in loc.subranes)){
                
                loc.subranes[g] = {subranes:{}, contacts:{}}
            }
            
            loc = loc.subranes[g]
        }

        loc.contacts[end] = contact
    }

    onRemoveContact( token:TokenIR){
        let [groups, end] = token

        let loc:any = this
        for (let g of groups) {
            loc = loc.subranes[g]
        }

        delete loc.contacts[end]
   
    }

    scan(dexp: string, flat = true) {
        //form a designator and scan the virtualized section representaion
        let desig = scannerF('subranes', 'contacts');
        let scan = desig(parseDesignatorString(dexp), this)

        if(flat){
            return tokenize(scan)
        }else{
            return scan
        }
    }

    contactChange(token: TokenIR, contact?:BasicContact<any>) {

        let m = matches(this.designator, token)

        
        
        if(m){
            m = compileToken(token) in m;
        }

        if(!m === !this.positive){

            
            //update virtualization
            if(contact){
                this.onAddContact(contact, token)
            }else{
                this.onRemoveContact(token)
            }

            //notify all downstream of the change
            super.contactChange(token, contact)                
        }


    }


}

export class Membrane extends Layer{

    contacts:{[label:string]:BasicContact<any>};
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
                let contact:BasicContact<any> = this.contacts[rk]

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

    addContact(contact:BasicContact<any>, label:string){
        let existing:BasicContact<any> = this.contacts[label];
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

    removeContact(label:string):BasicContact<any>{

        let removing:BasicContact<any> = this.contacts[label];

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

    notifyContactAdd(contact:BasicContact<any>, label){
        if(this.notify){
            this.contactChange([[],label], contact)
        }
    }

    notifyContactRemove(contact:BasicContact<any>, label){
        if (this.notify) {
            this.contactChange([[], label])
        }
    }

}
