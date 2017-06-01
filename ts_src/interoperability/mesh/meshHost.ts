
import * as I from '../interfaces'
import {Membrane} from '../membranes/membrane'
import {mediaConstructors} from '../media/medium'
import * as Designate from '../membranes/designable'

/**
 * A multimedia connections manager with updating
 */
export class RuleMesh implements I.MembraneWatcher {

    primary:Membrane;
    policy:I.ShellPolicy;
    rules:any;
    media:any;
    locations:any;

    exposed:any;


    constructor(initArgs:I.MeshInitialiser){

        this.primary = new Membrane();

        this.primary.watch(this);

        this.rules = {};
        this.media = {};
        this.locations = {};

        this.exposed = initArgs.exposed;
        for(let membraneKey in initArgs.membranes){
            this.primary.addSubrane(initArgs.membranes[membraneKey], membraneKey)
        }

        for (let mediakey in initArgs.rules){
            //Check there is an over creation of
            let newMedium = new mediaConstructors[mediakey]({label:mediakey, exposed:this.exposed})
            this.addMedium(mediakey, newMedium)
            this.parseRules(initArgs.rules[mediakey], mediakey);
        }


    }

    addMedium(key:string, medium:I.Medium<any,any>){
        this.rules[key] = [];
        this.media[key] = medium;

    }


    private parseRules(ruleset:string[], mediumkey:string){
        for(let link of ruleset){
            let linkIR = this.parseLink(link);
            this.addRule(linkIR, mediumkey)
        }
    }

    private parseLink(link:string):I.LinkRule{
        let m = link.match(/^([\w\*\:\.]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.]+)/)

        if(!m){throw new Error(`Unable to parse link description, expression ${link} did not match regex`)};
        let [match, srcDesig, srcClose, viceVersa, filter, matching, persistent, snkClose, snkDesig] = m;

        return {
            designatorA:Designate.parseDesignatorString(srcDesig),
            designatorB:Designate.parseDesignatorString(snkDesig),
            closeSource:srcClose==='|',
            closeSink:snkClose==='|',
            matching:matching==="=",
            propogation:filter !== ''?{'+':I.LINK_FILTERS.PROCEED,'-':I.LINK_FILTERS.DECEED, '!':I.LINK_FILTERS.ELSEWHERE}[filter]:I.LINK_FILTERS.NONE
        }

    }

    /**
     * Rule must be applied to existing contacts, .
     */
    addRule(rule:I.LinkRule, mediumkey:string){
        this.rules[mediumkey].push(rule);
        let dA = this.primary.tokenDesignate(rule.designatorA);
        let dB = this.primary.tokenDesignate(rule.designatorB);
        this.square(rule, dA, dB, mediumkey)
    }

    square(rule:I.LinkRule, desigA:Object, desigB:Object, mediumkey:string){
        let firstGlove = false;

        for(let tokenA in desigA){
            let contactA = desigA[tokenA];

            for (let tokenB in desigB){
                let doSuppose = true;
                let contactB = desigB[tokenB];
                let medium = this.media[mediumkey]

                let link:I.LinkSpec<any, any> = {
                    tokenA:tokenA,
                    tokenB:tokenB,
                    contactA:contactA,
                    contactB:contactB,
                    directed:true,
                    destructive:false
                }

                //if all other media do not hold an exclusive claim to the relevant contact
                for(let mk in this.media){
                    let claimer = this.media[mk]
                    if(mk !== mediumkey && claimer.hasClaim()){
                        throw new Error('Unable to suppose link when another medium has claimed the token')
                    }
                }

                if(rule.matching){
                    let label1 =  link.tokenA.match(/:(\w+)$/)[1]
                    let label2 =  link.tokenB.match(/:(\w+)$/)[1]
                    if(label1 !== label2){
                        doSuppose = false;
                    }
                }

                if(doSuppose){
                    if(medium.suppose(link)){
                        this.locations[tokenA] = this.locations[tokenA]||{}
                        this.locations[tokenB] = this.locations[tokenB]||{}
                        this.locations[tokenA][mediumkey] = medium
                        this.locations[tokenB][mediumkey] = medium
                    }
                }

            }
        }

    }

    onAddContact(contact:I.Contact, token:string){
        //introduce to medium

        for(let mediumkey in this.media){
            let medium:I.Medium<any,any> = this.media[mediumkey];
            let linkRules = <I.LinkRule[]>this.rules[mediumkey];


            if(contact instanceof medium.typeA){
                for(let rule of linkRules){
                    if(Designate.tokenDesignatedBy(token, rule.designatorA)){
                        let dB = this.primary.tokenDesignate(rule.designatorB)
                        let dA = {}; dA[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }

            }else if(contact instanceof medium.typeB){

                for(let rule of linkRules){
                    if(Designate.tokenDesignatedBy(token, rule.designatorB)){
                        let dA = this.primary.tokenDesignate(rule.designatorA);
                        let dB = {}; dB[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }
            }else{
                //ignore the case where the contact does not fit
            }

        }
    }

    onRemoveContact(contact:I.Contact, token:string){

        for (let loc in this.locations[token] ){

            let location:I.Medium<any,any> = this.locations[token][loc]

            if(contact instanceof location.typeA) {
                location.breakA(token, contact)
            }else if (contact instanceof location.typeB){
                location.breakB(token, contact)
            }
        }
    }

    onAddMembrane(membrane:Membrane, token){
        //scan all contacts on the removed membrane and remove them in this context
        let contactscan = membrane.designate("**:*", true)

        for(let token in contactscan){
            this.onAddContact(contactscan[token], membrane.getMembraneToken()+token)
        }
    }

    onRemoveMembrane(membrane:Membrane, token){
        let contactscan = membrane.designate("**:*", true)

        for(let token in contactscan){
            this.onRemoveContact(contactscan[token], membrane.getMembraneToken()+token)
        }
    }

}
