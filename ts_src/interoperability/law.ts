import {tokenize, DTotalExp, scannerF, matches, TokenIR, DFullExp, compileToken, DTermExp, parseDesignatorString, pairByBinding, DesignatorIR} from '../util/designation/all'
import {BaseMedium} from './media/base'
import {Layer, Section} from './membranes/membrane'
// export interface Handle {
//     retract()
//     blame(reason:string, deny:(justification:string)=>never, handle:Handle):(remedy)=>never
// }

export interface LinkIR {
    law:Law
    tokenA:string
    tokenB:string
    bindings:{[sym:string]:string}
}

export interface Link {
    laws:Law[],
    medium: BaseMedium<any,any>,
    from: ContactRecord,
    to: ContactRecord,
}

export interface ContactRecord {
    laws:Law[];
    token:string;
    contact:any;
    tags:string[];
    incoming:{[token:string]:Link}
    outgoing:{[token:string]:Link}
}


export interface LawIR {
    expression:string,
    designatorA:string,
    designatorB:string,
    matching:boolean,
    medium:string,
    key?:string
}

const linktype = '[-=~]'
const mediumMidExp = `-\\(\\w+\\)-|=\\(\\w+\\)=`
const mediumBounds = `(${linktype})\\((\\w+)\\)${linktype}`
const lawSplitExp = `(<)?(${mediumMidExp}|${linktype})(>)?`
const lawExp = new RegExp(`${DFullExp}(?:${lawSplitExp}${DFullExp})+`)
const lawWhiteExp = '\\s'

function crack(target, cracker){
    let m = target.match(cracker)
    return [m.input.slice(0, m.index), m[0], m.input.slice(m.index+m[0].length)]
}

function crackloop(target, cracker){
    
    let [current, link, end] = crack(target, cracker) 
    let tricks = [[current, null, link]]

    let trickdex = 0

    while(end.match(cracker)){
        [current, link, end] = crack(end, cracker) 
        tricks[trickdex][1] = current;
        
        trickdex++;
        tricks[trickdex] = [current, null, link]
    } 

    tricks[tricks.length-1][1] = end

    return tricks
}

export function parseLawExpression(linkexp: string, defaultMedium?:string):LawIR[]{
    let stripped = linkexp.replace(/\s/g,'') 
    
    let matched = stripped.match(lawExp)
    
    if(matched){
        let tricks = crackloop(stripped, lawSplitExp)
        let laws = []
        
        
        for (let [lexp,rexp,l] of tricks){
            let [whole, left, mid, right] = l.match(lawSplitExp)
            
            let medium; 
            
            let mediumMatch = mid.match(mediumBounds)
            if(mediumMatch){
                medium = mediumMatch[2]
                mid = mediumMatch[1]
            } else if (defaultMedium){
                medium = defaultMedium
            } else {
                throw new Error("No medium provided to the law -(medium)-> ")
            }


            let matching = mid === '=' || mid == '+'

            if(right){
                laws.push({
                    expression:linkexp,
                    designatorA:lexp,
                    designatorB:rexp,
                    matching:matching,
                    medium: medium,
                    
                })
            }
            
            if(left){
                laws.push({
                    expression:linkexp,
                    designatorA: rexp,
                    designatorB: lexp,
                    matching: matching,
                    medium: medium,
                })
            } 

        }
        return laws
    }else{
        throw new Error("Invalid law expression")
    }
}

const scan = scannerF()

export class Pancedent extends Section {

    partner:Pancedent
    watchsym:symbol|string

    bindings:any

    constructor(public law:Law, public leftToRight:boolean){
        super(true, law.spec[leftToRight ? 'designatorA' : 'designatorB'])
    }

    onAddContact(contact, token: TokenIR) {
       super.onAddContact(contact,token)
        
        // INDUCT
       if (this.leftToRight) {
            this.law.medium.claimSeat(compileToken(token), contact, this.law)
        } else {
            this.law.medium.claimTarget(compileToken(token), contact, this.law)
        }

    }
    
    onRemoveContact(token: TokenIR) {
        super.onRemoveContact(token)

        if(this.leftToRight){
            this.law.medium.dropSeat(compileToken(token), this.law)
        }else{
            this.law.medium.dropTarget(compileToken(token), this.law)
        }
    }

    contactChange(token: TokenIR, contact?: any) {
        let match = matches(this.designator, token)

        
        if (match) {        
        
            //collects the bindings for the partner
            let oscan = tokenize(scannerF('subranes','contacts')(this.partner.designator, this.partner))

            if (contact) {
                this.onAddContact(contact, token)
                let tokenstr = compileToken(token)
                match[tokenstr] = contact
                if(this.leftToRight){
                    this.law.square(match, oscan)
                }else{
                    this.law.square(oscan, match)
                }
            } else {
                this.onRemoveContact(token)
            }
        }
    }



    watchOn(layer:Layer){
        this.watchsym = layer.addWatch(this)
    }

    watchOff(layer:Layer){
        layer.removeWatch(this.watchsym)    
    }

    
}

//looking in from a waeve, constructed 
export class Law {

    left:Pancedent
    right:Pancedent
    medium:BaseMedium<any,any>
    links:Link[]
    target:Layer

    constructor(public spec:LawIR){
        this.left = new Pancedent(this, true)
        this.right = new Pancedent(this,false)

        this.left.partner = this.right
        this.right.partner = this.left
    }

    engage(layer:Layer, medium:BaseMedium<any,any>){

        this.medium= medium;
        this.target = layer

        this.left.watchOn(layer)
        this.right.watchOn(layer)
        
    }

    disengage(){
        //consequently dropping contact claims and therefore disconnecting
        this.left.watchOff(this.target);
        this.right.watchOff(this.target);
    }

    square(from, to) {
        let pairs = pairByBinding(from, to)

        for (let pair of pairs) {

            let linkIR = this.produceLinkIR(pair);

            let linkSpec = {
                bindings: pair.bindings,
                seatToken: pair.tokenA,
                targetToken: pair.tokenB
            }

            let liveLink = this.medium.supposeLink(linkSpec, this)

            if (liveLink) {
                //create a record of the link here
                // this.links.push({
            //     from: pair.tokenA,
                //     to: pair.tokenB,
                //     laws:this
                // })
            }
        }
    }

    produceLinkIR({ tokenA, tokenB, bindings }):LinkIR{
        return {
            tokenA, tokenB, bindings, law:this
        }
    }

}