import * as Jungle from "../../../jungle";
import * as D from "../../../construction/domain"

const j = Jungle.j
/**
 * Test categories

    - domain extension
    - provided domain expectation
    - basis designation in subdomain
    - definition of domains.

 */

describe('Domains', function(){

    describe('functions', function(){
        it('is construct', function(){
            class B extends Jungle.Construct {}
            expect(D.isConstruct(B)).toBe(true)

            function Cons () {}
            expect(D.isConstruct(Cons)).toBe(false)
        })

    })

    describe('definition', function(){

        it('can be defined with subdomains', function(){
            let domain = new Jungle.Domain()
                .define('OneNature', function (patch) {
                    this.stuff = patch
                })

                .sub('oneThing')
                    .define('inThing', j({
                        goods:'testable'
                    }))

                .up()

            
            expect(new domain.exposed.OneNature("blah").stuff).toBe("blah")
            expect(domain.subdomain.oneThing.registry.inThing.body.goods).toBe("testable")
        })

        it('can be defined as isolated', function(){

            // a test nature
            class Bike extends Jungle.Construct {}

            let domain = new Jungle.Domain()
                .define('uniso', Bike)
                .sub('sub1',{isolated:true})
                    .define('iso1', Bike)
                .up()

            let located = domain.subdomain.sub1;
            expect((<any>located).isolated).toBe(true, 'is isolated')
            expect(located instanceof Jungle.Domain).toBe(true, 'can still find isolated instanceof domain')

            expect(located.recover({basis:'iso1'}) instanceof Bike).toBe(true)

            //if the domain was not isolated it would find the nature in the root
            expect(function(){
                located.seek('uniso', true)
            }).toThrowError()

        })

        it('by default it is not possible to redefine any basis or subdomain in a domain', function(){

            let domain = new Jungle.Domain()
                .define('peculiar', j('something'))

            expect(function(){
                domain.define('peculiar', j(function(){}))
            }).toThrowError('Cannot Redefine: "peculiar" is already defined in this domain')
        })

    })

    describe('recovery', function(){
        it('should operate within the given domain', function(){

            class N1 extends Jungle.Construct {}
            class N2 extends Jungle.Construct {}

            let domain = new Jungle.Domain()
                .sub('sub1')
                    .define('natural', N1)
                    .up()
                .sub('sub2')
                    .define('natural', N2)
                    .up()

            let operating = domain.subdomain.sub1
            expect(operating.recover({basis:'natural'}) instanceof N1).toBe(true)
            operating = domain.subdomain.sub2
            expect(operating.recover({basis:'natural'}) instanceof N2).toBe(true)

        })

        it('should can select a basis from a subdomain', function(){

            class thing extends Jungle.Construct {}

            let domain = new Jungle.Domain()
                .sub('sub0')
                    .sub('sub1')
                        .define('thing', thing)
                    .up()
                .up()

            expect(domain.seek('sub0.sub1:thing').entry.basis.name).toBe('thing')
        })

        it('can select from the parent domain by basis fallback', function(){
            let subDom = new Jungle.Domain({})

            let domain  = new Jungle.Domain()
                .sub('sub',subDom)
                .define('fallback', j((x) => (x)))
            

            expect(subDom.seek('fallback').entry.body(0)).toBe(0)
        })

        it('can select a deep domain by fallback', function (){
            let root = new Jungle.Domain({})
                .define('comp', Jungle.Composite)
                .define('cstr', Jungle.Construct)

            let field = root.sub('field')
                .define('situation', j('comp', {
                    deep:j('comp',{
                        tacked:j('tack:fact')
                    })
                }))
 
            let tack  = field.sub('tack')
                .define('fact', j('cstr', {
                    word:'bird'
                }))

            let scene = field.recover('situation')

            expect(scene.exposed.deep.tacked.word).toBe('bird')
            expect((<any>scene).subconstructs.deep.subconstructs.tacked.domain).toBe(tack, 
         "when domains are chosen the target will be given their domain of definition")
        })

    })

    describe('extensibility', function(){

        let domain:Jungle.Domain, extendspy:jasmine.Spy, ef

        beforeEach(function(){

            extendspy = jasmine.createSpy('extend')

            class N extends Jungle.Construct {}

            ef = function(){
                extendspy(this.body.apropri)
            }

            domain = new Jungle.Domain()
                .define('nature1', j(N,{
                    head:{
                        prime:ef
                    }
                }))
                
                .define("basis1", j("nature1", {
                    apropri:'unextended'
                }))
        })

        it('should extend a prior basis to the same domain under a different name',function(){

            domain.define('basis2',j('basis1',{
                apropri:'extended'
            }))


            let rec = domain.recover(j('basis1'))

            expect(rec.origins).toEqual(['nature1', 'basis1'])
            expect(extendspy).toHaveBeenCalledWith('unextended')


            extendspy.calls.reset()

            domain.recover(j('basis2'))
            expect(extendspy).toHaveBeenCalledWith('extended')

        })

        it('should extend something to a subdomain under it', function(){
            domain.sub("sub")
                .define('deeper', j('basis1',{
                    apropri:'deeepExtend'
                }))

            domain.recover({basis:'sub:deeper'})

            expect(extendspy).toHaveBeenCalledWith('deeepExtend')

        })

        it('should extend from a subdomain', function(){
            domain.sub("sub")
                .define('deeper', j('basis1',{
                    apropri:'deeepExtend'
                }))

            domain.define('backDown', j('sub:deeper',{
                     apropri:'undeepExtend'
                }))

            domain.recover({basis:'backDown'})
            expect(extendspy).toHaveBeenCalledWith('undeepExtend')

        })

        it('vanilla objects should meld into the body', function(){
            domain.define('whatever', j(Jungle.Construct))

            domain.define('basic', j(Jungle.Construct, {
                deepen:j('whatever', {
                    prop:'atfirst'
                })
            }))

            domain.define('overmeld',j('basic', {
                deepen:{
                    prop:'atlast'
                }
            }))

            let c:any = domain.recover('overmeld')

            expect(c.nucleus.deepen.body.prop).toBe('atlast')
        })

        it('should treat arrays as anon and clobber the base', function(){
            domain.define('afterthought', j('nature1',{
                stuffs:j([
                    'a','b','c'
                ])
            }))

            domain.define('inline', j('afterthought',{
                stuffs:['d','e','f']
            }))

            let c = domain.recover('inline')

            expect(c.nucleus.stuffs.anon).toEqual(['d', 'e', 'f'])
        })
    })


    describe('description', function(){
        
        it('should be able to be describe to get back to description',function(){
            
            let d = new Jungle.Domain()
                .define('basic', j(Jungle.Construct,{
                    prop0:0
                }))

                .define('extended', j('basic',{
                    prop1:1
                }))

            let r = d.recover(j('extended'))

            expect(d.describe(r)).toEqual({
                basis:'extended',
                head:{},
                body:{},

            })

        })

        it('should retain changes to structure through layers',function(){

            let d = new Jungle.Domain()
                .define('nature', j(Jungle.Construct, {
                    head:{
                        prime(){
                            this.body.coax = 10;
                        }
                    }
                }))

            let c = d.recover(j('nature'))
            let desc = d.describe(c)
        
            expect(desc.body.coax).toBe(10)
        })

        it('should describe with target to determine exit point', function(){
            let d = new Jungle.Domain()
                .define('nature', j(Jungle.Construct, {
                    prop:0
                }))

                .define('based', j('nature', {
                    prop:1,
                    extended:"foo"
                }))
            
            let c = d.recover(j('based'))

            
            //exit before any debasing
            expect(d.describe(c, false)).toEqual({
                basis:Jungle.Construct,
                head:{},
                body:{
                    prop:1,
                    extended:'foo'
                },
                origins:['nature', 'based']
            })
            
            //exit at first basis
            let descNature = d.describe(c,'nature')
            expect(descNature).toEqual({
                basis:'nature',
                head:{},
                body:{
                    prop:1,
                    extended:'foo'
                },
                origins:['based']
            })

            //exit at top 
            let descBased = d.describe(c, 'based')

            expect(descBased).toEqual({
                basis:'based',
                head:{},
                body:{}
            })

        })

        it('should deep describe ', function(){

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

        let domain = new Jungle.Domain()
            //.use(otherDomain)


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
