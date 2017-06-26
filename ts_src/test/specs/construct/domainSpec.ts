
import Jasmine = require('jasmine');
import * as Jungle from "../../../jungle";

//import {J,U,N,G,L,E} from 'jungle'
//Junction, Util, Null, Generic, Link, Extend

/**
 * Test categories

    - domain extension
    - provided domain expectation
    - basis designation in subdomain
    - definition of domains.

 */

describe('Domains', function(){

    describe('definition', function(){

        it('can be defined by a single object', function(){
            let domain = new Jungle.Domain({
                OneNature:function(patch){
                    this.stuff = patch
                },
                oneThing:new Jungle.Domain({
                    inThing:{
                        nature:Array,
                        patch:{
                            goods:'testable'
                        }
                    }
                })
            })
        })

        it('can be defined as isolated', function(){

            // a test nature
            function Bike(spec){}

            let domain = new Jungle.Domain({
                uniso:Bike,

                sub1:new Jungle.Domain({
                    iso1:Bike
                },true)

            })
            let located = domain.locateDomain('sub1');
            expect(located instanceof Jungle.Domain).toBe(true, 'can still find isolated instanceof domain')

            expect(located.recover({basis:'iso1'}) instanceof Bike).toBe(true)

            //if the domain was not isolated it would find the nature in the root
            expect(function(){
                located.locateBasis('uniso')
            }).toThrowError()

        })

        it('by default it is not possible to redefine any basis or subdomain in a domain', function(){

            let domain = new Jungle.Domain({
                peculiar(){}
            })

            expect(function(){
                domain.addNature('peculiar', function(){}, {})
            }).toThrowError('Domain cannot contain duplicates "peculiar" is already registered')
        })

    })

    describe('recovery', function(){
        it('should operate within the given domain', function(){

            function N1(){}
            function N2(){}

            let domain = new Jungle.Domain({

                sub1:new Jungle.Domain({
                    natural:N1
                }),

                sub2:new Jungle.Domain({
                    natural:N2
                }),
            })

            let operating = domain.locateDomain('sub1')
            expect(operating.recover({'basis':'natural'}) instanceof N1).toBe(true)
            operating = domain.locateDomain('sub2')
            expect(operating.recover({basis:'natural'}) instanceof N2).toBe(true)


        })

        it('should can select a basis from a subdomain', function(){
            let domain = new Jungle.Domain({

                sub0:new Jungle.Domain({
                    sub1:new Jungle.Domain({
                        thing(){}
                    })
                })

            })
            expect(domain.locateBasis('sub0.sub1:thing').nature.name).toBe('thing')
        })

        it('can select from the parent domain by basis fallback', function(){

        })

    })

    describe('extensibility', function(){

        let domain:Jungle.Domain, extendspy:jasmine.Spy;

        beforeEach(function(){

            extendspy = jasmine.createSpy('extend')

            function N(spec){
                extendspy(spec.apropri)
            }

            domain = new Jungle.Domain({
                nature1:N
            })

            domain.extend("nature1", "basis1", {
                apropri:'unextended'
            })

        })

        it('should extend a prior basis to the same domain under a different name',function(){

            domain.extend('basis1','basis2', {
                apropri:'extended'
            })

            expect(domain.registry['basis2'].nature).toBe(domain.registry['basis1'].nature)

            domain.recover({basis:'basis1'})
            expect(extendspy).toHaveBeenCalledWith('unextended')
            extendspy.calls.reset()

            domain.recover({basis:'basis2'})
            expect(extendspy).toHaveBeenCalledWith('extended')

        })

        it('should extend something to a subdomain under it', function(){
            domain.branch("sub")
            domain.extend('basis1', 'sub:deeper', {
                apropri:'deeepExtend'
            })

            domain.recover({basis:'sub:deeper'})

            expect(extendspy).toHaveBeenCalledWith('deeepExtend')

        })

        it('should extend from a subdomain', function(){
            domain.branch("sub")
            domain.extend('basis1', 'sub:deeper', {
                apropri:'deeepExtend'
            })

            domain.extend('sub:deeper', 'backDown', {
                apropri:'undeepExtend'
            })

            domain.recover({basis:'backDown'})
            expect(extendspy).toHaveBeenCalledWith('undeepExtend')

        })


    })


    /**
     * domains should be able to rest upon the presence of some other domain from outside.
     this will be achieved using external modules to manage the dependency.

        the domain should be able to define extensions of depended at run.

        this is lower priority because it is a sugar layer over the module system of the platform

     */
    xdescribe('domain dependency', function(){
        let otherDomain = new Jungle.Domain()

        function require(somemodule){
            //load the domain or nature import
        }

        let domain = new Jungle.Domain({
            USE:['externalA', otherDomain],
            dep1:new Jungle.Domain('external'),
            dep2:require('ext-domain')
        })


        //export defualt domain

    })

    /**
     * Domain schema exist so that synchronizability across domains can be assured or limited to only possible.
     * a cell that joins a syncronized representation cluster expresses its domain scheme to it's peers.
     */
    xdescribe('schema', function(){

        it('can express a scheme')

        it('can verify a sceme as matching, subvening, and supervening to its own')

    })

    /**
     * Theoretically possible but unknown implications of complexity
     */
    xdescribe('hot redefine', function(){

        it('is possible to redefine a basis and have it automatically reset its active instances', function(){

        })

    })



})
