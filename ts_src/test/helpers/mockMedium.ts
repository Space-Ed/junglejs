
import {Medium, LinkSpec} from '../../interoperability/interfaces'

export interface MockMediumSpec {
    typeA?: Function;
    typeB?: Function;
    hasToken?: (token: string) => boolean;
    hasClaim?: (link: LinkSpec<any, any>) => boolean;
    hasLink?: (link: LinkSpec<any, any>) => boolean;
    suppose?: (supposedLink: LinkSpec<any, any>) => boolean;
}

export class MockMedium implements Medium<any,any> {

    typeA: Function;
    typeB: Function;

    breakA:(token: string, a?: any)=>void
    breakB:(token: string, b?: any)=>void
    hasToken:(token: string)=> boolean;
    hasClaim:(link: LinkSpec<any, any>)=> boolean;
    hasLink:(link: LinkSpec<any, any>)=> boolean;
    suppose:(supposedLink: LinkSpec<any, any>)=> boolean;
    disconnect:(link: LinkSpec<any, any>)=>void

    constructor(spec:MockMediumSpec){

        this.typeA = spec.typeA
        this.typeB = spec.typeB

        let forb=(x)=>{
            if(x instanceof Function){
                return x
            }else{
                return ()=>(x||false)
            }
        }

        this.breakA = jasmine.createSpy('breakA')
        this.breakB = jasmine.createSpy('breakB')
        this.hasToken = jasmine.createSpy('hasToken').and.callFake(forb(spec.hasToken))
        this.hasClaim = jasmine.createSpy('hasClaim').and.callFake(forb(spec.hasClaim))
        this.hasLink = jasmine.createSpy('hasLink').and.callFake  (forb(spec.hasLink))
        this.suppose = jasmine.createSpy('suppose').and.callFake  (forb(spec.suppose))
        this.disconnect = jasmine.createSpy('disconnect')
    }

}