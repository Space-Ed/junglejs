
import * as I from '../interfaces'
import {Membrane, MembraneEvents,DemuxWatchMethodsF} from '../membranes/membrane'
import {mediaConstructors} from '../media/medium'
import * as Designate from '../membranes/designable'
import {Designator} from '../../util/designator'

/**
 * A multimedia connections manager with updating
 */
export class RuleMesh implements I.MembraneWatcher {

    primary:Membrane;
    rules:any;
    media:any;
    locations:any;

    exposed:any;

    changeOccurred

    constructor(initArgs:I.MeshInitialiser){

        this.changeOccurred = DemuxWatchMethodsF(this)

        this.primary = initArgs.membrane;
        this.primary.addWatch(this);

        this.exposed = initArgs.exposed;

        this.rules = {};
        this.media = {};
        this.locations = {};

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
            designatorA:new Designator('subranes','contacts', srcDesig),
            designatorB:new Designator('subranes','contacts', snkDesig),
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
        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
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
                    if(rule.designatorA.matches(token)){
                        let dB = rule.designatorB.tokenDesignate(this.primary)
                        let dA = {}; dA[token] = contact;
                        this.square(rule, dA, dB, mediumkey);
                    }
                }

            }else if(contact instanceof medium.typeB){

                for(let rule of linkRules){
                    if(rule.designatorB.matches(token)){
                        let dA = rule.designatorA.tokenDesignate(this.primary)
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
        //all contacts on the removed membrane will be removed
    }

    onRemoveMembrane(membrane:Membrane, token){
        //
    }

}
