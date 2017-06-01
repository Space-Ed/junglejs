
let Jungle = require('../../build/jungle.js');
let {Membrane, CallOut, CallIn} = Jungle.IO;
let Designate = require('../../build/interoperability/membranes/designable.js');
let TestHost = require('../helpers/testHost.js')

describe('basic membrane', function(){

    let memb, host;

    beforeEach(function(){

        host =  new TestHost('host1-base')
        memb = host.primary
    })

    afterEach(function(){
    })

    it('should allow addition and removal of ports', function(){
        let newb = new CallIn({label: 'calledA'});
        let new2 = new CallOut({label: 'caller1'})

        memb.addContact('calledA', newb);
        memb.addContact('caller1', new2);

        expect(memb.terminals.calledA).toBe(newb);
        expect(memb.terminals.caller1).toBe(new2);

        memb.removeContact("calledA");
        memb.removeContact("caller1");

        expect(memb.terminals.calledA).toBeUndefined();
        expect(memb.terminals.caller1).toBeUndefined();
    })

    describe('designation', function(){
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('populate works', function(){
            expect(memb.terminals.a).not.toBeUndefined();
            expect(memb.terminals.b).not.toBeUndefined();
            expect(memb.terminals.y).not.toBeUndefined();
            expect(memb.terminals.x).not.toBeUndefined();

        })

        it('should designate with direct IR',function(){
            let designated = memb.tokenDesignate({
                mDesignators:[],
                cDesignator:/.*/
            });

            expect(Object.keys(designated).length).toBe(4)
        })
    })

    describe('inversion', function(){
        let invert;
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
            invert = memb.invert();
        })

        it('should have inverted those cruxes already present', function(){
            let desall = invert.designate(":*", 'called');

            expect(desall[':y']).not.toBeUndefined();
            expect(desall[':x']).not.toBeUndefined();
        })

        it('should invert further cruxes added', function(){
            memb.addContact('lame-o',new CallOut({label:'lame-o'}));

            //console.log(invert.terminals)
            let desall = invert.designate(":*");

            expect(desall[':lame-o']).not.toBeUndefined();

            //a caller in the inversion is a called in the original
            invert.addContact('cool-cat',new CallOut({label:'cool-cat'}));
            let desallop = memb.designate(":*");
            expect(desallop[':cool-cat']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.designate(':a','caller', false);

            invert.removeContact(desiga[0],'caller');
            expect(invert.designate(':a', "caller", false)[0]).toBeUndefined();

        })

    })

    describe('nested membranes', function(){
        let subhost, submemb

        beforeEach(function(){
            subhost = new TestHost('SubHost')

            submemb = subhost.primary;
            memb.addSubrane(submemb, 'sub')

            subhost.populate(['_a','x_']);
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('should allow designation at depth', function(){

            let desig = memb.designate('sub:a')
            expect(desig['sub:a']).toBe(submemb.terminals.a)
        })

        it('globbing should collect at many depths',function(){
            let sub2 = new Membrane(subhost)

            sub2.addContact('a', new CallIn({label:'a'}));
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.designate('sub.sub:a', 'called')
            expect(desig['sub.sub:a']).toBe(sub2.terminals.a)

            let desigAll = memb.designate('**.sub:a', 'called')
            expect(desigAll['sub.sub:a']).toBe(sub2.terminals.a)
            expect(desigAll['sub:a']).toBe(submemb.terminals.a)

        })

        describe('membrane change notifications', function(){
            let additions;

            function scanForToken(allArgs, token, tokenArgNumber){

                let scanCollection = []

                for(let arglist of allArgs){
                    if(arglist[tokenArgNumber] === token){
                        scanCollection.push(arglist);
                    }
                }

                return scanCollection;
            }

            beforeEach(function(){
                additions = host.addspy.calls.allArgs();
            })
            //when ports are added the host of the membrane and all parent membranes is informed
            it('should notify  when my membrane has a crux added',function(){
                //all additions reported
                expect(additions.length).toEqual(6);
            });

            it('should notify when a sub membrane has a crux added',function(){
                expect(scanForToken(additions, 'sub:a', 1)[0][0]).toBe(subhost.primary.terminals.a)
            });

            it('should notify me when a membrane is added',function(){
                let membadd = host.membaddspy.calls.allArgs()
                //console.log(membadd)
                expect(membadd.length).toEqual(1);
            });

            it('should notify me when a crux is removed from my membrane')
            it('should notify me when a crux is removed from a sub membrane')
            it('should notify me when a sub membrane is added')


        })

    })

    it('shoule converr designator to token regex', function(){
        let basic = Designate.designatorToRegex('a:p', 'role');
        expect('a:p'.match(basic)).not.toBeNull();

        let onewild = Designate.designatorToRegex('*:p', 'role');
        expect('a:p'.match(onewild)).not.toBeNull();

        let leadingGlob = Designate.designatorToRegex('**.a:*', 'blart');
        expect('globby.glob.blob.a:farts'.match(leadingGlob)).not.toBeNull();

        let multiGlob = Designate.designatorToRegex('**.a.**:p', 'blart');
        expect('globby.a.globby:p'.match(multiGlob)).not.toBeNull();

        let trickyGlob = Designate.designatorToRegex('**.a.**:p', 'blart');
        //console.log('trickyGlob:', trickyGlob);
        expect('globby.a.a.a:p'.match(trickyGlob)).not.toBeNull();

    })


})
