import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {meld} from "../../util/ogebra/operations";

function forwardPointPrepare(section:IO.Section, configval:any, point:string):IO.Section{
    if(typeof configval === 'string'){
        return section.createSection(configval)
    }else if(configval === true){
        return section
    }else if( configval === false){
        return undefined
    }else{
        throw new Error(`Invalid config value for head setting ${point}, must be boolean or designator string` )
    }
}

/*

*/
export class Cell extends CS.Composite implements I.CellAnchor{

    host:Cell;
    shell:IO.Membrane;
    lining:IO.Membrane;
    mesh:IO.RuleMesh;

    released:IO.Section;
    witheld:IO.Section;

    forwarding:string|boolean;
    retaining:string|boolean;
    

    constructor(domain?:CS.Domain){
        super(domain)

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();

        //the internal interlinking mechanism
        this.mesh = new IO.RuleMesh(this.lining)

    }

    /*
        setup the parts of the cell that are contingent on specialisation
    */
    applyHead(head:any={}){
        //creates state, pool and tractors from head
        super.applyHead(head)



      
    }

    /*
        undo the setup so that a new head can be applied
    */
    clearHead(){
        // this.remove('heart')

        // super.clearHead()
        //everything recreated is sufficient
    }


    attach(anchor:Cell, alias){
        super.attach(anchor, alias)

        console.log(this.head)

        
        
        //release defaults to true, but withold trumps release
        let release = this.head.withold === true ? false : (this.head.release === undefined ? true :this.head.release)
        
        //withold & retain default to false
        let withold = this.head.withold === undefined ? (anchor.head.retain === true?true:false) : this.head.withold;
        let retain = anchor.head.retain === undefined ? false : anchor.head.retain;
        
        //witholding trumps false retain 
        if(!retain && withold === true){
            retain = true
        }

        //default to forward as long as we do not retain all
        let forward = anchor.head.forward === undefined ? true : anchor.head.forward;

        //retain trumps forward
        if(retain === true && forward === true){
            forward = false
        }
        
        //withold has precedence of section.
        let witheld = forwardPointPrepare(this.shell, withold, 'withold')
        let released = forwardPointPrepare(this.shell, release, 'release')

        if(witheld){
            let retained = forwardPointPrepare(witheld, retain, 'anchor retain')
            if (retained) {
                anchor.lining.addSubrane(retained, alias)
            }
        }
        
        if (released) {
            let forwarded = forwardPointPrepare(released, forward, 'anchor forward')    
            if (forwarded){
                //so long as we have released and forwarded and the shell is not retained
                anchor.shell.addSubrane(forwarded, alias)
            }
        }
    }

    detach(anchor:Cell, alias){
        super.detach(anchor, alias)

        anchor.lining.removeSubrane(alias)
        anchor.shell.removeSubrane(alias)
    }

    scan(designator:string){
        return this.shell.designate(designator)
    }

    seek(designator:string){
        let all = this.scan(designator)
        return all[Object.keys(all)[0]]
    }
}
