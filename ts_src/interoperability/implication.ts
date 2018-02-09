import {Claim, Link} from './media/base'

export interface Implicant {

}

export function implicantsOfClaim(claim: Claim){
    //the medium of the claim and the contact and the laws supporting the claim
    let implicants = new Set <Implicant>(claim.sponsors)
    implicants.add(claim.medium)
    implicants.add(claim.contact)
    return implicants
}

export function implicantsOfLink(link: Link){
    let implicants = new Set<Implicant>(link.sponsors)
    implicants.add(link.target.medium)
    implicants.add(link.target.contact)
    implicants.add(link.seat.contact)
    return implicants
}