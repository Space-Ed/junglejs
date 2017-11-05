import * as IO from '../../interoperability/all'
import * as CS  from '../../construction/all'

import{ShellPolicy, FreePolicy, Contact} from '../../interoperability/interfaces'
import * as I from '../interfaces'
import {meld} from "../../util/ogebra/operations";

function forwardPointPrepare(section:IO.Layer, configval:any, point:string):{positive: IO.Layer, negative: IO.Layer}{
    if(typeof configval === 'string'){
        
        return {positive: section.createSection(configval, 'WTF'), negative: section.createSection(configval, '', false)}
    }else if(configval === true){
        return { positive: section, negative:undefined}
    }else if( configval === false){
        return { positive: undefined, negative: section}
    }else{
        throw new Error(`Invalid config value for head setting ${point}, must be boolean or designator string` )
    }
}

/*

*/
export class Cell extends CS.Composite {

    host:Cell;
    shell:IO.Membrane;
    lining:IO.Membrane;
    weave:IO.Weave

    released:IO.Section;
    witheld:IO.Section;

    forwarding:string|boolean;
    retaining:string|boolean;
    

    constructor(domain?:CS.Domain){
        super(domain)

        this.shell = new IO.Membrane();
        this.lining = this.shell.invert();

        //the internal interlinking mechanism
        this.weave = new IO.Weave({
            target:this.lining
        })

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
        let retainer = new IO.Section(true, "**:*")
        
        let { positive: witheld, negative: unwitheld } = forwardPointPrepare(this.shell, this.head.withold === undefined ? false : true, 'witheld')
        
        if(witheld !== undefined){
            witheld.addWatch(retainer)
        }
        
        let { positive: released, negative: unreleased } = forwardPointPrepare(unwitheld, this.head.release === undefined ? true : false, 'released')
        if(released !== undefined){
            let { positive: retained, negative: unretained } = forwardPointPrepare(released, anchor.head.retain === undefined ? false : true, 'retained')
            if(retained !== undefined){
                
                retained.addWatch(retainer)
            }

            if(unretained !== undefined){
                let { positive: forwarded, negative: unforwarded } = forwardPointPrepare(unretained, anchor.head.forward === undefined ? true : false, 'forwarded')
                if(forwarded !== undefined){
                    anchor.shell.addSubrane(forwarded, alias)
                }
            }
        }
 
        anchor.lining.addSubrane(retainer, alias)
    }
    
    detach(anchor:Cell, alias){
        super.detach(anchor, alias)

        anchor.lining.removeSubrane(alias)
        anchor.shell.removeSubrane(alias)
    }

    scan(designator:string){
        return this.shell.scan(designator)
    }

    seek(designator:string){
        let all = this.scan(designator)
        return all[Object.keys(all)[0]]
    }
}
