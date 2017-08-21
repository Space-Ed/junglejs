
import * as I from '../interfaces'
import {Membrane, MembraneEvents,DemuxWatchMethodsF} from '../membranes/membrane'
import {mediaConstructors, BaseMedium} from '../media/medium'
import {Designator} from '../../util/designator'
import {pairByBinding} from "../../util/designation/matching";
/**
 * A multimedia connections manager with updating
 */
export class RuleMesh implements I.MembraneWatcher {

    primary:Membrane;
    rules:any;
    media:any;
    locations:any;

    changeOccurred

    constructor(membrane:Membrane){

        this.changeOccurred = DemuxWatchMethodsF(this)

        this.primary = membrane;
        this.primary.addWatch(this);

        this.rules = {};
        this.media = {};
        this.locations = {};

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
        let m = link.match(/^([\w\*\:\.#]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.#]+)/)

        if(!m){throw new Error(`Unable to parse link description, expression ${link} did not match regex`)};
        let [match, srcDesig, srcClose, backward, filter, matching, forward, snkClose, snkDesig] = m;

        let ruleIR  =  {
            designatorA:new Designator('subranes','contacts', srcDesig),
            designatorB:new Designator('subranes','contacts', snkDesig),
            closeA:srcClose==='|',
            closeB:snkClose==='|',
            forward:forward==='>',
            backward:backward==='<',
            matching:matching==="=",
            propogation:filter !== ''?{'+':I.LINK_FILTERS.PROCEED,'-':I.LINK_FILTERS.DECEED, '!':I.LINK_FILTERS.ELSEWHERE}[filter]:I.LINK_FILTERS.NONE
        }

        return ruleIR
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
        }else if(typeof rule === 'object'){
            //add by IR

            // console.log("rules", this.rules, 'for id ', ruleID)
            //when the rule has a name it can be found
            if(ruleID !== undefined){
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

    removeRule(mediumID:string, ruleID:string){
        let rule:I.LinkRule = this.rules[mediumID][ruleID]

        if(rule === undefined){
            throw new Error(`The rule: ${rule} being removed does not exist in medium ${mediumID}`)
        }

        let dA = rule.designatorA.tokenDesignate(this.primary);
        let dB = rule.designatorB.tokenDesignate(this.primary);
        this.balanceSquare(rule, dA, dB, mediumID, true)
    }

    balanceSquare(rule:I.LinkRule, dA:Object, dB:Object, mediumkey:string, destructive:boolean){
        let op = destructive? this.unsquare : this.square;

        if(rule.forward){
            op.call(this, rule, dA, dB, mediumkey)
        }

        if(rule.backward){
            op.call(this, rule, dB, dA, mediumkey)
        }

    }

    unsquare(rule:I.LinkRule, desigA:Object, desigB:Object, mediumkey:string){

        let pairs = pairByBinding(desigA, desigB, rule.matching)

        for(let pair of pairs){
            let tokenA = pair.tokenA
            let tokenB = pair.tokenB
            let contactA = desigA[tokenA];
            let contactB = desigB[tokenB];
            let medium:I.Medium<any,any> = this.media[mediumkey]

            let link:I.LinkSpec<any, any> = {
                tokenA:tokenA,
                tokenB:tokenB,
                contactA:contactA,
                contactB:contactB,
                bindings:pair.bindings
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

    square(rule:I.LinkRule, desigA:Object, desigB:Object, mediumkey:string){
        let firstGlove = false;

        let pairs = pairByBinding(desigA, desigB, rule.matching)

        for(let pair of pairs){
            let tokenA = pair.tokenA
            let tokenB = pair.tokenB

            let contactA = desigA[tokenA];
            let contactB = desigB[tokenB];
            let medium = this.media[mediumkey]

            let link:I.LinkSpec<any, any> = {
                bindings:pair.bindings,
                tokenA:tokenA,
                tokenB:tokenB,
                contactA:contactA,
                contactB:contactB
            }

            //if all other media do not hold an exclusive claim to the relevant contact
            for(let mk in this.media){
                let claimer = this.media[mk]
                if(mk !== mediumkey && claimer.hasClaim(link)){
                    throw new Error('Unable to suppose link when another medium has claimed the token')
                }
            }

            let supposeResult = medium.suppose(link)
            if(supposeResult){
                this.locations[tokenA] = this.locations[tokenA]||{}
                this.locations[tokenB] = this.locations[tokenB]||{}
                this.locations[tokenA][mediumkey] = medium
                this.locations[tokenB][mediumkey] = medium
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

             for(let ruleID in linkRules){
                 let rule:I.LinkRule = linkRules[ruleID]
                 let matchA = rule.designatorA.matches(token);
                 let matchB = rule.designatorB.matches(token);

                 if(matchA){
                     // match from the contact A to the contact B
                     let dB = rule.designatorB.tokenDesignate(this.primary)
                     let dA = {}; dA[token] = contact;
                     this.balanceSquare(rule, dA, dB, mediumkey, false)
                 }

                 if(matchB){
                     let dA = rule.designatorA.tokenDesignate(this.primary)
                     let dB = {}; dB[token] = contact;
                     this.balanceSquare(rule, dA, dB, mediumkey, false)

                 }
             }

        }
    }

    onRemoveContact(contact:I.Contact, token:string){
        for (let loc in this.locations[token] ){

            let location:I.Medium<any,any> = this.locations[token][loc]

            if(contact instanceof location.typeA) {
                location.breakA(token, contact)
            }
            if (contact instanceof location.typeB){
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

    hasLinked(tokenA, tokenB, directed=true){
        let mediaWithA = this.locations[tokenA]

        for(let mediakey in mediaWithA){
            let medium:BaseMedium<any,any> = this.media[mediakey]
            let aToMap =  medium.matrix.to[tokenA];
            let bFromMap = medium.matrix.from[tokenB];

            let aToB = aToMap !== undefined &&  aToMap[tokenB] !== undefined;
            let bFromA = bFromMap !== undefined && bFromMap[tokenA] !== undefined

            if(directed && (aToB && bFromA)){
                return true
            }else if(!directed && (aToB || bFromA)){
                return true
            }
        }

        return false
    }

}
