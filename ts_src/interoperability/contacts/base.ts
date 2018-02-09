
// import * as I from '../interfaces'

import {implicantsOfClaim, implicantsOfLink, Implicant} from '../implication'
import {ConstraintToken, evaluateConstraint, ConstraintResult} from '../constraint'
import {ContactToMedium, Claim} from '../media/base'

export namespace I {
    export interface ContactHost {
        invert():ContactHost
    }
}

export abstract class BaseContact<Partner extends BaseContact<any>> implements ContactToMedium{

    //has bee
    public inverted = false;
    protected partner:Partner;

    abstract seatConstraint:ConstraintToken;
    abstract targetConstraint:ConstraintToken;

    claims:Set<Claim>
    pendingClaims:Set<Claim>

    constructor(){
        this.claims = new Set()
        this.pendingClaims = new Set() 
    }
    
    attemptClaim(claim:Claim){
        this.pendingClaims.add(claim)

        this.checkSelf()

        let implicants = []
        let impressions = this.collectImpressions()

        impressions.links.forEach(link=>{
            implicants = [...implicants, ...implicantsOfLink(link)]
        })

        implicants.every((implicant:Implicant)=>{
            //are you ok with this claim
            return implicant.check()
        })



    }

    seatClaims(){
        const filt = (claim) => (claim.outbound !== undefined)
        return [...this.claims].filter(filt).concat([...this.pendingClaims].filter(filt))
    }

    targetClaims(){
        const filt = (claim) => (claim.inbound !== undefined)
        return [...this.claims].filter(filt).concat([...this.pendingClaims].filter(filt))    }

    //check that all pending 
    checkSelf(){
        let seatClaimsCount = this.seatClaims().length
        let targetClaimsCount = this.targetClaims().length

        let targetConstraintResult = evaluateConstraint(this.targetConstraint, targetClaimsCount)
        let seatConstraintResult = evaluateConstraint(this.seatConstraint, seatClaimsCount)

        if (targetConstraintResult === true && seatConstraintResult === true){
            return true
        } else {
            
        }
    }

    collectImpressions(){
        let impressions= {
            links:new Set<Link>(),
            claims:new Set<Claim>()
        }

        this.claims.forEach((claim)=>{
            impressions.claims.add(claim)

            for(let t in claim.outbound){
                impressions.links.add(claim.outbound[t])
            }

            for (let t in claim.inbound) {
                impressions.links.add(claim.inbound[t])
            }
        })

        return impressions
        

    }


    status(){

    }

    complete(){

    }

    hypotheticalDrop(claim:Claim){

    }

    lodgeClaim(claim:Claim){

    }

    lodgeDrop(){

    }



    /**
     * if possible create the partner that will appear on the other side and put it there.
     * this action is undertaken when added to a membrane
     */
    invert():Partner{
        if (this.partner === undefined && this.invertable === true){
            this.partner = this.createPartner()
            this.inverted = true;

            this.partner.partner = this;
            this.partner.inverted = true;

        }
        return this.partner;

    }

    //---------------Copy to Implement-------------

    //Is the contact appearing on both sides of the membrane?
    public abstract invertable:boolean;

    //after super.invert() this.partner to refer to the opposite side
    // invert():Partner{
    //      super.invert()
    // }

    //must return the partner contact if invertable is true
    createPartner():Partner{
        return undefined
    }

    //--------------End Copy-----------------------


}
