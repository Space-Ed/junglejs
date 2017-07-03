
import * as I from '../interfaces'
import {Membrane, MembraneEvents,DemuxWatchMethodsF} from '../membranes/membrane'
import {mediaConstructors, BaseMedium} from '../media/medium'
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

        //map of media keys to media
        for (let mediakey in initArgs.media){
            this.addMedium(mediakey, initArgs.media[mediakey])
        }

        //map of media keys to rule sets to apply
        for (let mediakey in initArgs.rules){
            this.parseRules(initArgs.rules[mediakey], mediakey);
        }


    }

    addMedium(key:string, medium:I.Medium<any,any>){
        this.rules[key] = [];
        this.media[key] = medium;

    }


    protected parseRules(ruleset:string[], mediumkey:string){
        for(let link of ruleset){
            let linkIR = this.parseLink(link);
            this.addRule(linkIR, mediumkey)
        }
    }

    protected parseLink(link:string):I.LinkRule{
        let m = link.match(/^([\w\*\:\.]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.]+)/)

        if(!m){throw new Error(`Unable to parse link description, expression ${link} did not match regex`)};
        let [match, srcDesig, srcClose, backward, filter, matching, forward, snkClose, snkDesig] = m;

        return {
            designatorA:new Designator('subranes','contacts', srcDesig),
            designatorB:new Designator('subranes','contacts', snkDesig),
            closeA:srcClose==='|',
            closeB:snkClose==='|',
            forward:forward==='>',
            backward:backward==='<',
            matching:matching==="=",
            propogation:filter !== ''?{'+':I.LINK_FILTERS.PROCEED,'-':I.LINK_FILTERS.DECEED, '!':I.LINK_FILTERS.ELSEWHERE}[filter]:I.LINK_FILTERS.NONE
        }

    }

    /**
     * Rule must be applied to existing contacts, .
     */
    addRule(rule:I.LinkRule|string, mediumkey:string, ruleID?:string){
        if(this.rules[mediumkey] === undefined){
            throw new Error(`Unable to create rule ${mediumkey} is not a recognised media type`)
        }

        if(typeof rule === 'string'){
            //parse and add by IR
            this.addRule(this.parseLink(rule), mediumkey, ruleID)
        }else{
            //add by IR

            //when the rule has a name it can be found
            if(ruleID !== undefined){
               //console.log("rules", this.rules, 'for id ', ruleID)
                this.rules[mediumkey][ruleID] = rule
            }else{
                //an enumeration by addition order for anonymous rules
                this.rules[mediumkey].push(rule);
            }

            let dA = rule.designatorA.tokenDesignate(this.primary);
            let dB = rule.designatorB.tokenDesignate(this.primary);


            this.balanceSquare(rule, dA, dB, mediumkey, false)
        }
    }

    balanceSquare(rule:I.LinkRule, dA:Object, dB:Object, mediumkey:string, destructive:boolean){
        let op = destructive? this.unsquare : this.square;
        let isUndirected = !rule.backward && !rule.forward
        if(rule.forward || isUndirected){
            op.call(this, rule, dA, dB, mediumkey)
        }

        if(rule.backward){
            op.call(this, rule, dB, dA, mediumkey)
        }

    }

    removeRule(mediumID:string, ruleID:string){
        let rule:I.LinkRule = this.rules[mediumID][ruleID]

        if(rule === undefined){
            throw new Error(`The rule: ${rule} being removed does not exist in medium ${mediumID}`)
        }

        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
        this.balanceSquare(rule, dA, dB, mediumID, true)
    }

    unsquare(rule:I.LinkRule, desigA:Object, desigB:Object, mediumkey:string){
        for(let tokenA in desigA){
            let contactA = desigA[tokenA];

            for (let tokenB in desigB){
                let doSuppose = true;
                let contactB = desigB[tokenB];
                let medium:I.Medium<any,any> = this.media[mediumkey]

                let link:I.LinkSpec<any, any> = {
                    tokenA:tokenA,
                    tokenB:tokenB,
                    contactA:contactA,
                    contactB:contactB,
                    directed:(rule.backward || rule.forward)
                }

                if(medium.hasLink(link)){
                    medium.disconnect(link)

                    //if this token is no longer represented in the medium
                    if(!medium.hasToken(tokenA)){
                        delete this.locations[tokenA][mediumkey]
                    }

                    if(!medium.hasToken(tokenA)){
                        delete this.locations[tokenB][mediumkey]

                    }
                }
            }

        }
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
                    directed:(rule.backward || rule.forward)
                }

                //if all other media do not hold an exclusive claim to the relevant contact
                for(let mk in this.media){
                    let claimer = this.media[mk]
                    if(mk !== mediumkey && claimer.hasClaim(link)){
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

            /**
            *   a contact could be elegable for either or both positions
                we must ensure that if it is in both positions

             */


            if(contact instanceof medium.typeA){
                for(let ruleID in linkRules){
                    let rule = linkRules[ruleID]
                    if(rule.designatorA.matches(token)){
                        let dB = rule.designatorB.tokenDesignate(this.primary)
                        let dA = {}; dA[token] = contact;

                        console.log('sideA', dA, "sideB", dB)
                        this.balanceSquare(rule, dA, dB, mediumkey, false)
                    }
                }
            }

            if(contact instanceof medium.typeB){

                for(let ruleID in linkRules){
                    let rule = linkRules[ruleID]
                    if(rule.designatorB.matches(token)){
                        let dA = rule.designatorA.tokenDesignate(this.primary)
                        let dB = {}; dB[token] = contact;
                        console.log('sideA', dA, "sideB", dB)
                        this.balanceSquare(rule, dA, dB, mediumkey, false)
                    }
                }
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
