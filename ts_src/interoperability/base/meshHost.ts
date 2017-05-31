
import * as I from './interfaces'
import {Membrane} from './membrane'
import {Crux} from './crux'
import {mediaConstructors} from './medium'
import * as Designate from '../designation/designable'

/**
 * A multimedia connections manager with updating
 */
export class RuleMesh implements I.MembraneHost {

    primary:Membrane;
    policy:I.ShellPolicy;
    roleToMedia:any;
    rules:any;
    media:any;

    exposed:any;


    constructor(initArgs:I.MeshInitialiser){

        this.primary = new Membrane(this);
        this.roleToMedia = {};
        this.rules = {};
        this.media = {};

        this.exposed = initArgs.exposed;
        for(let membraneKey in initArgs.membranes){
            this.primary.addSubrane(initArgs.membranes[membraneKey], membraneKey)
        }

        for (let mediakey in initArgs.rules){
            //Check there is an over creation of
            let newMedium = new mediaConstructors[mediakey]({label:mediakey, exposed:this.exposed})
            this.addMedium(mediakey, newMedium)
            this.parseRules(initArgs.rules[mediakey], mediakey, newMedium);
        }


    }

    addMedium(key:string, medium:I.Medium<any,any>){
        //Check if we are over stacking roles?
        this.rules[key] = [];
        this.media[key] = medium;

        this.roleToMedia[medium.roleA] = key;
        this.roleToMedia[medium.roleB] = key;
    }


    private parseRules(ruleset:string[], mediumkey:string, medium:I.Medium<any,any>){
        for(let link of ruleset){
            let linkIR = this.parseLink(link, medium);
            this.addRule(linkIR, mediumkey, medium)
        }
    }

    private parseLink(link:string, medium:I.Medium<any,any>):I.LinkRule{
        let m = link.match(/^([\w\*\:\.]+)(\|?)(<?)([\+\-\!]?)([=\-])(>?)(\|?)([\w\*\:\.]+)/)

        if(!m){throw new Error(`Unable to parse link description, expression ${link} did not match regex`)};
        let [match, srcDesig, srcClose, viceVersa, filter, matching, persistent, snkClose, snkDesig] = m;

        return {
            designatorA:Designate.parseDesignatorString(srcDesig, medium.roleA),
            designatorB:Designate.parseDesignatorString(snkDesig, medium.roleB),
            closeSource:srcClose==='|',
            closeSink:snkClose==='|',
            matching:matching==="=",
            propogation:filter !== ''?{'+':I.LINK_FILTERS.PROCEED,'-':I.LINK_FILTERS.DECEED, '!':I.LINK_FILTERS.ELSEWHERE}[filter]:I.LINK_FILTERS.NONE
        }

    }

    /**
     * Rule must be applied to existing contacts, .
     */
    addRule(rule:I.LinkRule, mediumkey:string, medium:I.Medium<any,any>){
        this.rules[mediumkey].push(rule);
        let dA = this.primary.tokenDesignate(rule.designatorA);
        let dB = this.primary.tokenDesignate(rule.designatorB);
        this.designateCheckConnect(rule, dA, dB, medium)
    }

    designateCheckConnect(rule:I.LinkRule, desigA:Object, desigB:Object, medium:I.Medium<any,any>){
        for(let tokenA in desigA){
            let designatedA = desigA[tokenA];

            for (let tokenB in desigB){
                let designatedB = desigB[tokenB];

                let link:I.LinkSpec<any, any> = {
                    tokenA:tokenA,
                    tokenB:tokenB,
                    roleA:designatedA.roles[medium.roleA],
                    roleB:designatedB.roles[medium.roleB],
                    directed:true,
                    destructive:false
                }

                //if all other media do not hold an exclusive claim to the relevant crux
                for(let mk in this.media){
                    let claimer = this.media[mk]
                    if(claimer !== medium && claimer.hasClaim()){
                        throw new Error('Unable to suppose link when another medium has claimed the token')
                    }
                }

                console.log(designatedA.label, " , " ,designatedB.label)

                if(!rule.matching || (designatedA.label === designatedB.label)){
                    medium.suppose(link)
                }

            }
        }

    }

    onAddCrux(crux:Crux, role:string, token:string){
        //introduce to medium
        let medium:I.Medium<any,any> = this.media[this.roleToMedia[role]];
        let linkRules = <I.LinkRule[]>this.rules[this.roleToMedia[role]];
        let designator;

        if(role === medium.roleA){
            for(let rule of linkRules){
                if(Designate.tokenDesignatedBy(token, rule.designatorA)){
                    let dB = this.primary.tokenDesignate(rule.designatorB)
                    let dA = {}; dA[token] = crux;
                    this.designateCheckConnect(rule, dA, dB, medium);
                }
            }
        }else if(role === medium.roleB){
            for(let rule of linkRules){
                if(Designate.tokenDesignatedBy(token, rule.designatorB)){
                    let dA = this.primary.tokenDesignate(rule.designatorA);
                    let dB = {}; dB[token] = crux;
                    this.designateCheckConnect(rule, dA, dB, medium);
                }
            }
        }else{
            throw new Error("Not a valid crux addition role does not match medium")
        }
    }

    onRemoveCrux(crux:Crux, role:string, token:string){

        let location:I.Medium<any,any> = this.media[this.roleToMedia[role]]

        if(role === location.roleA){
            console.log('remove crux: ', crux, ' , token:', token)
            location.breakA(token, role)
        }else if (role === location.roleB){
            location.breakB(token, role)
        }

    }

    onAddMembrane(membrane:Membrane, token){
        //All of the roles used in any of the media of the mesh are used to fund the cruxes
        //therefore it will not include yet unseen roles

        for(let role in this.roleToMedia){
            let cruxscan = membrane.designate("**:*", role, true)

            for(let token in cruxscan){
                this.onAddCrux(cruxscan[token], role, membrane.getMembraneToken()+token)
            }
        }

    }

    onRemoveMembrane(membrane:Membrane, token){
        for(let role in this.roleToMedia){
            let cruxscan = membrane.designate("**:*", role, true)

            for(let token in cruxscan){
                this.onRemoveCrux(cruxscan[token], role, membrane.getMembraneToken()+token)
            }
        }

    }

}
