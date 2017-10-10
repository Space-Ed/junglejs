import {Designator, DTotalExp, DFullExp, DTermExp} from '../util/designator'

// export interface Handle {
//     retract()
//     blame(reason:string, deny:(justification:string)=>never, handle:Handle):(remedy)=>never
// }

// export interface LinkIR {
//     law:LawActual,
//     tokenA:string,
//     tokenB:string,

//     contactA:Contact,
//     contactB:Contact,
// }

// export interface LinkActual {
//     laws:LawActual[],
//     medium:Medium,
//     A: ContactRecord,
//     B: ContactRecord,

// }

// export interface ContactRecord {
//     token:string;
//     tags:string[];  
//     medium:Medium,
//     contact:any; 
// }

// export interface LawActual {
//     ir:LawIR,
//     medium:Medium,
//     designatorA:Designator,
//     designatorB:Designator,
//     links:LinkActual[],
// }


// export class Law {

//     constructor(public ir:LawIR, weave){

//     } 


// }

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
