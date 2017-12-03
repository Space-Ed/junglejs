
import {Domain, isNature} from './construction/domain'

import * as Util from './util/all'
import * as IO  from './interoperability/all'
import * as TRT from './tertiary/all'
import * as CST from './construction/all'

export * from './util/all'
export * from './interoperability/all'
export * from './construction/all'
export * from './tertiary/all'

export interface JDescription {
    basis: string,
    head: any,
    body: any
}

/**
 * @param basis: the existing domain entry from which to start
 * @param body:  the deeply merged patch 
*/
export function j(basis: string, body?): JDescription
export function j(obj: Object): { basis: 'object', head: any, body: any }
export function j(arr: Array<any>): { basis: 'array', head: any, body: any }
export function j(nature:Function, body?):JDescription
/**
 * normalize javascript types to the standard jungle description format that is compatible with domain definition and composition
 * 
 * @param basis a starting point for the description
 * @param patch  the overlaid patch on the description
 */
export function j(basis?: any, patch?: any) {  
    let head, domain, body, anon, dbasis;

    if (typeof basis === 'string' || isNature(basis)) {
        dbasis = basis;
        if (Util.isVanillaObject(patch)) { //("",{})
            if('body' in patch && !('head' in patch)){
                //head is the baseline 
                head = patch
                body = head.body

                delete patch.body;
            }else{
                //body is baseline or no baseline
                head = patch.head || {};
                body = patch.body || patch;
                delete patch.head;
            }
            
            domain = patch.domain
            anon = patch.anon
            delete patch.domain;
            delete patch.anon
        } else if (Util.isVanillaArray(patch)) { //("",[])
            anon = patch            
        } else if (patch !== undefined) { //("", any)
            body = patch
        }
    } else if (Util.isVanillaObject(basis)) { //({})
        head = basis.head
        delete basis.head
        anon = basis.anon
        delete basis.anon

        body = basis
        dbasis = 'object'
    } else if (Util.isVanillaArray(basis)) { //([])
        dbasis ='array',
        anon = basis
    } else if (Util.isPrimative(basis)) { //(number|boolean|symbol)
        dbasis = typeof basis,
        body = basis
    } else if (basis !== undefined){ //(any)
        dbasis = 'strange',
        body =  basis
    } else { // ()
        dbasis = undefined
    }

    let desc:any = {}

    desc.basis = dbasis
    if(head !== undefined) desc.head = head
    if(body !== undefined) desc.body = body
    if(anon !== undefined) desc.anon = anon
    if(domain !== undefined) desc.domain = domain

    return desc
}

export const J = new Domain()
J   .sub('media')
        .define('multiplexer', j(TRT.MediumConstruct, {
            head: {
                medium: IO.MuxMedium,
            }
        }))

        .define('direct',j('multiplexer', {
            symbols:[],
            emitArgType: IO.DEMUXARG.ONE,
            emitRetType: IO.MUXRESP.LAST,
            emitCallType:IO.CALLTYPE.DIRECT
        }))

        .define('cast', j('multiplexer', {
            symbols: [],
            emitArgType: IO.DEMUXARG.DONT,
            emitRetType: IO.MUXRESP.LAST,
            emitCallType: IO.CALLTYPE.BREADTH_FIRST
        }))
        
        .define('switch', j('multiplexer', {
            symbols: [],
            emitArgType: IO.DEMUXARG.SOME,
            emitRetType: IO.MUXRESP.MAP,
            emitCallType: IO.CALLTYPE.BREADTH_FIRST
        }))

        .define('compose', j('multiplexer', {
            symbols: [],
            emitArgType: IO.DEMUXARG.DONT,
            emitRetType: IO.MUXRESP.MAP,
            emitCallType: IO.CALLTYPE.BREADTH_FIRST
        }))

        .define('race', j('multiplexer', {
            symbols: [],
            emitArgType: IO.DEMUXARG.DONT,
            emitRetType: IO.MUXRESP.RACE,
            emitCallType: IO.CALLTYPE.BREADTH_FIRST
        }))

        .define('serial', j('multiplexer', {
            symbols: [],
            emitArgType: IO.DEMUXARG.DONT,
            emitRetType: IO.MUXRESP.LAST,
            emitCallType: IO.CALLTYPE.SERIAL
        }))
    .up()

    .define('cell',TRT.Cell)

    .define('object',TRT.Cell)

    .define('array',TRT.Cell)

    .define('law',TRT.LawConstruct)

    .define('reflex', j(TRT.Reflex, {
         mode: 'reflex',
        inner: false,
        outer: false,
    }))

    .define('carry', j(TRT.Carry, {
            mode: 'carry',
            inward: false,
            outward: false
    }))

    .define('resolve', j(TRT.Resolve, {
            inner: false,
            outer: false,
            either: false,
        }))

    .define('spring', j(TRT.Spring, {
            mode: 'spring',
            inward: false,
            outward: false,
            outfirst: false,
            serial: false,
            composed: false
    }))

    .define('deposit', j(TRT.Deposit))

    .define('raw_op', TRT.OpConstruct)
    

    .define('outward', j('carry', {
        outward:true
    }))

    .define('inward', j('carry', {
        inward:true
    }))

    .define('spring_in' , j('spring', {
        inward:true  
    }))

    .define('spring_out', j('spring', {
        inward:false  
    }))