import * as IO from '../interoperability/all'
import {Composite} from './complex/composite'
import{MembraneHost, ShellPolicy, FreePolicy} from '../interoperability/base/interfaces'
import {JungleDomain} from './base/domain'

/*

*/
export class Cell extends Composite implements MembraneHost {

    mesh:IO.RuleMesh;
    membranes:any;
    nucleus:any;
    policy:ShellPolicy;

    constructor(spec:any){
        //overridable
        spec.domain = spec.domain || JungleDomain
        super(spec)

        this.nucleus = {};

        this.policy = FreePolicy
        this.membranes = {}
        this.membranes.shell = new IO.Membrane(this);
        this.membranes.lining = this.membranes.shell.invert();

        this.mesh = new IO.RuleMesh({
            membranes:this.membranes,
            rules:{
                'distribute':[]
            },
            exposed:this.nucleus
        })
    }


    addStrange(k, v){
        //just include all strange
        this.nucleus[k]=v
    }
    //
    // prime(){
    //     super.prime();
    // }
    //
    // induct(host:Cell, key){
    //     super.induct(host, key);
    // }


    //reacting to additions
    onAddCrux(crux,role,token){
    }

    onRemoveCrux(crux,role,token){
    }

    onAddMembrane(membrane, token){
    }

    onRemoveMembrane(membrane, token){
    }
}
JungleDomain.register('Cell', Cell)
