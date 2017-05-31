import {Membrane} from './membrane'
import {Crux} from './crux'

export enum LINK_FILTERS {
    PROCEED, DECEED, ELSEWHERE, NONE
}

export interface LinkRule {
    designatorA:CruxDesignator;
    designatorB:CruxDesignator;
    closeSource:boolean;
    closeSink:boolean;
    matching:boolean;
    propogation:LINK_FILTERS;
}

export interface MeshInitialiser {
    membranes:any,
    rules:any,
    exposed:any
}

export interface Medium<A extends Contact,B extends Contact>{
    label:string;
    roleA:string;
    roleB:string;

    breakA(token:string, a:A);
    breakB(token:string, b:B);
    hasClaim(link:LinkSpec<A,B>):boolean;
    suppose(supposedLink: LinkSpec<A,B>):boolean;
}

export interface LinkSpec<A,B> {
    tokenA:string,
    tokenB:string,
    roleA:A,
    roleB:B,
    directed:boolean,
    destructive:boolean
}

export interface MediumSpec {
    exclusive?:boolean;
    multiA?:boolean;
    multiB?:boolean;
    directedOnly?:boolean;

    exposed:any;
    label:string;
}

export interface ShellPolicy {
    fussy:boolean;
    allowAddition:boolean;
    allowRemoval:boolean;

}

export const FreePolicy:ShellPolicy = {
    fussy:false,
    allowAddition:true,
    allowRemoval:true
}

export interface MembraneHost{
    policy:ShellPolicy;

    onAddCrux:(crux:Crux, role:string, token:string)=>void;
    onRemoveCrux:(crux:Crux, role:string, token:string)=>void;

    onAddMembrane:(membrane:Membrane, token)=>void;
    onRemoveMembrane:(membrane:Membrane, token)=>void;

}

export interface Designable {
    treeDesignate(desig:CruxDesignator)
}

export interface CruxDesignator{
    role:string;
    mDesignators:string[]|RegExp[]|((membrane:Membrane, key:string)=>boolean)[];
    cDesignator:string|RegExp|((crux:Crux)=>boolean);
}

/**
    The interface for generic behaviours all mesh exposed contacts need to define,
    capped: - whether the contact has been covered by a close link or hook.
 */
export interface Contact {
    capped:boolean;
}
