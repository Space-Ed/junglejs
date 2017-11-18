import {Law} from '../law'
import {BaseContact} from '../contacts/base'

export interface ContactToMedium {
    isClaimed():boolean,
    isContested():boolean,
    claim(medium:BaseMedium<any, any>),
    isSeatable:boolean,
    isTargetable:boolean,
}


export interface MediumConsumed {
    claimTarget(token:string, claim:BaseContact<any>, sponsor:Law)
    claimSeat(token:string, claim:BaseContact<any>, sponsor:Law)
    supposeLink(link:LinkSpec, sponsor:Law)
    revokeLink(link:LinkSpec, sponsor:Law)
    dropTarget(token: string, sponsor: Law)
    dropSeat(token: string, sponsor: Law)
    hasClaim(token):boolean
    hasLink(seatToken, targetToken):boolean
}

export interface MediumImplementor {

    seatType:Function
    targetType:Function
    inductSeat(claim:Claim)
    inductTarget(claim:Claim)
    retractSeat(token:string)
    retractTarget(token:string)
    connect(link:Link)
    disconnect(link:Link)
    canClaimSeat(token:string, contact:BaseContact<any>)
    canClaimTarget(token:string, contact:BaseContact<any>)
    canConnect(link:Link)

}

export interface LinkSpec {
    seatToken: string,
    targetToken: string,
    bindings: { [sym: string]: string },
    [other: string]: any
}

export interface Link<S extends BaseContact<any> = BaseContact<any>, T extends BaseContact<any>= BaseContact<any>>{
    seat: Claim<S>,
    target: Claim<T>,
    bindings: any,
    sponsors: Set<Law>
    active: boolean
}

export interface Claim <C extends BaseContact<any> = BaseContact<any>> {
    sponsors: Set<Law>

    outbound?:{[to:string]:Link<C, BaseContact<any>>}
    inbound?: {[from: string]:Link<BaseContact<any>, C>}
    token:string,
    contact:C,
    valid:boolean
}

export abstract class BaseMedium<S extends BaseContact<any>, T extends BaseContact<any>> implements MediumConsumed, MediumImplementor{
    protected claims: { [token: string]: Claim<BaseContact<any>>}
    abstract seatType: Function
    abstract targetType: Function
    abstract fanIn:boolean
    abstract fanOut:boolean

    constructor(){
       this.claims = {}
    }

    claimTarget(token: string, target: BaseContact<any>, sponsor: Law){
        this.claimCommon(token, target, sponsor, false)
    }

    claimSeat(token: string, seat: BaseContact<any>, sponsor: Law){
        this.claimCommon(token, seat, sponsor, true)
    }

    claimCommon(token: string, claim: BaseContact<any>, sponsor: Law, isSeat:boolean){
        if (token in this.claims) {
            let existing = this.claims[token]
            existing.sponsors.add(sponsor)
            existing[isSeat?'outbound':'inbound'] = existing[isSeat?'outbound':'inbound'] || {}
        } else {
            let newclaim: Claim = {
                sponsors: new Set([sponsor]),
                contact: claim,
                token: token,
                valid: true
            }

            newclaim[isSeat ? 'outbound' : 'inbound'] = {}

            // if (claim.isClaimed()) {
            //     newclaim.valid = false
            //     claim.contest(this, newclaim)
            //     sponsor.contest()
            // }

            claim.claim(this)
            this[isSeat?'inductSeat':'inductTarget'](newclaim)
            this.claims[token] = newclaim
        }
    }


    supposeLink(link: LinkSpec, sponsor: Law){
        
        let seatClaim = this.claims[link.seatToken]
        let targetClaim = this.claims[link.targetToken]

        if(seatClaim == undefined || targetClaim == undefined){
            throw Error('cannot link between unclaimed contacts')
        }
        
        //link exists
        let linked = this.claims[link.seatToken].outbound[link.targetToken]
        
        if(linked !== undefined){
            
            // handling binding conflict 
            let binding = this.reduceBindings(linked.bindings, link.bindings)

            if(binding){
                linked.bindings = binding
            }else{
                //invalid binding must disconnect
                if(linked.active){
                    linked.active = false;
                    this.disconnect(linked);
                }
             }
            
            linked.sponsors.add(sponsor)


        }else{
            let newlink = {
                active: true,
                bindings: link.bindings,
                seat: seatClaim,
                target: targetClaim,
                sponsors: new Set([sponsor])
            }

            this.claims[link.seatToken].outbound[link.targetToken] = newlink
            this.claims[link.targetToken].inbound[link.seatToken] = newlink
            this.connect(newlink)
        }

    }

    private reduceBindings(existing, neu){
        //only one law can provide a binding to the link
        if(Object.keys(existing).length > 0){
            if(Object.keys(neu).length >0) {
                return false
            }else{
                return existing
            }
        }else if (Object.keys(neu).length  > 0){
            return neu
        }else{
            return {}
        }
    }

    revokeLink(link: LinkSpec, sponsor: Law){

        let existing = this.claims[link.seatToken].outbound[link.targetToken]

        existing.sponsors.delete(sponsor)

        if(existing.sponsors.size === 0){
            this.removeLink(existing)
        }

    }

    dropTarget(token: string, sponsor: Law){
        this.dropCommon(token, sponsor, false)
    }

    dropSeat(token: string, sponsor: Law){
        this.dropCommon(token, sponsor, true)
    }

    private dropCommon(token: string, sponsor: Law, isSeat:boolean){
        let existing = this.claims[token]

        if(existing){
            existing.sponsors.delete(sponsor)

            if(existing.sponsors.size == 0){
                //drop contact breaking all links
                let links = existing[isSeat ? 'outbound' : 'inbound']

                for(let token in links){
                    let link = links[token]
                    this.removeLink(link)
                }

                this[isSeat?'retractSeat':'retractTarget'](token)
                delete this.claims[token]
            }
        }
    }

    private removeLink(link:Link){
        //disconnect and remove link
        delete link.seat.outbound[link.target.token]
        delete link.target.inbound[link.seat.token]
        this.disconnect(link)
    }

    hasClaim(token): boolean {
        return token in this.claims
    }

    hasLink(seatToken, targetToken): boolean {
        return this.hasClaim(seatToken) && this.hasClaim(targetToken) && this.claims[seatToken].outbound[targetToken]!== undefined
    }

    canClaimSeat(token: string, contact: BaseContact<any>){
        return contact instanceof this.seatType && contact.isSeatable
    }

    canClaimTarget(token: string, contact: BaseContact<any>){
        return contact instanceof this.targetType && contact.isTargetable
    }

    canConnect(link: Link){
        return true
    }

    exportMatrix(reverse=false):{[token:string]:{[token:string]:Link<S,T>}}{
        let matrix = {};
        
        for (let aToken in this.claims){
            if(Object.keys(this.claims[aToken][(reverse?'inbound':'outbound')]).length === 0) continue;

            matrix[aToken] = {}
            let opp = this.claims[aToken][(reverse ? 'inbound' : 'outbound')]

            for(let bToken in opp){
                matrix[bToken] = opp[bToken]
            }
        }
        
        return matrix
    }

    abstract inductSeat(claim: Claim)
    abstract inductTarget( claim: Claim)
    abstract retractSeat(token: string)
    abstract retractTarget(token: string)
    abstract connect(link: Link)
    abstract disconnect(link: Link)
}