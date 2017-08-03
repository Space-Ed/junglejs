import {Membrane} from './membranes/membrane'
import {BasicContact} from './contacts/base'
import {Designator} from '../util/designator'

export enum CALL_MODE {
    PUSH, GET, REQUEST, PROXY
}

export interface CallContactSpec {
    label:string,
    tracking?:boolean,
    syncOnly?:boolean,
    mode?: CALL_MODE,
    hook?:Function,
    default?:any
}

export interface Hookable {
    set?:(value)=>void;
    get?:()=>any;
    hook:(descriptor:{get?:()=>any, set?:(value:any)=>void}) =>void;
    unhook:()=>void;
}


export enum LINK_FILTERS {
    PROCEED, DECEED, ELSEWHERE, NONE
}

export interface LinkRule {
    designatorA:Designator;
    designatorB:Designator;
    closeA:boolean;
    closeB:boolean;
    forward:boolean;
    backward:boolean;
    matching:boolean;
    propogation:LINK_FILTERS;
}

export interface LinkSpec<A,B> {
    tokenA:string,
    tokenB:string,
    contactA:A,
    contactB:B,
    bindings:{[sym:string]:string}
}

export interface MeshInitialiser {
    membrane:Membrane,
    rules:any,
    media:any,
    exposed:any
}

export interface MediumSpec {
    exclusive?:boolean;
    multiA?:boolean;
    multiB?:boolean;
    directedOnly?:boolean;

    exposed:any;
    label:string;
}

export interface Medium<A extends Contact, B extends Contact>{
    typeA:Function;
    typeB:Function;

    breakA(token:string, a:A);
    breakB(token:string, b:B);
    hasToken(token:string):boolean;
    hasClaim(link:LinkSpec<A,B>):boolean;
    hasLink(link:LinkSpec<A,B>):boolean;
    suppose(supposedLink: LinkSpec<A,B>):boolean;
    disconnect(link: LinkSpec<A,B>);
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

export interface MembraneWatcher {

    onAddContact:(contact:BasicContact<any>, token:string)=>void;
    onRemoveContact:(contact:BasicContact<any>, token:string)=>void;

    onAddMembrane:(membrane:Membrane, token)=>void;
    onRemoveMembrane:(membrane:Membrane, token)=>void;

}

export interface Designable {
    treeDesignate(desig:ContactDesignator)
}

export interface ContactDesignator{
    mDesignators:string[]|RegExp[]|((membrane:Membrane, key:string)=>boolean)[];
    cDesignator:string|RegExp|((contact:Contact)=>boolean);
}

/**
    The interface for generic behaviours all mesh exposed contacts need to define,
    capped: - whether the contact has been covered by a close link or hook.
 */
export interface Contact extends BasicContact<any> {

}
