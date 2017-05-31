
let Jungle = require('../../dist/jungle.js');
let {Membrane, CallCrux, Crux, PortCrux} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')

fdescribe('basic membrane', function(){

    let memb, host;

    beforeEach(function(){

        host =  new TestHost('host1-base')
        memb = host.primary
    })

    afterEach(function(){
    })

    it('should allow addition and removal of ports', function(){
        let newb = new CallCrux({label: 'calledA'});
        let new2 = new CallCrux({label: 'caller1'})

        memb.addCrux(newb, 'called');
        memb.addCrux(new2, 'caller');

        expect(memb.roles.called.calledA).toBe(newb);
        expect(memb.roles.caller.caller1).toBe(new2);

        memb.removeCrux(newb, 'called');
        memb.removeCrux(new2, 'caller');

        expect(memb.roles.called.calledA).toBeUndefined();
        expect(memb.roles.caller.caller1).toBeUndefined();
    })

    describe('designation', function(){
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('populate works', function(){
            expect(memb.roles.called.a).not.toBeUndefined();
            expect(memb.roles.called.b).not.toBeUndefined();
            expect(memb.roles.caller.y).not.toBeUndefined();
            expect(memb.roles.caller.x).not.toBeUndefined();

        })

        it('should designate with direct IR',function(){
            let a = memb.tokenDesignate({
                role:'called',
                mDesignators:[],
                cDesignator:/.*/
            });

            expect(a[':a/called'].label).toBe('a')
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

            expect(desall[':y/called']).not.toBeUndefined();
            expect(desall[':x/called']).not.toBeUndefined();
        })

        it('should invert further cruxes added', function(){
            memb.addCrux(new PortCrux('lame-o'), 'caller');

            //console.log(invert.roles.called)
            let desall = invert.designate(":*", 'called');
            expect(desall[':lame-o/called']).not.toBeUndefined();

            //a caller in the inversion is a called in the original
            invert.addCrux(new PortCrux('cool-cat'), 'caller');
            let desallop = memb.designate(":*", 'called');
            expect(desallop[':cool-cat/called']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.designate(':a','caller', false);

            invert.removeCrux(desiga[0],'caller');
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

            let desig = memb.designate('sub:a', 'called')
            expect(desig['sub:a/called']).toBe(submemb.roles.called.a)
        })

        it('globbing should collect at many depths',function(){
            let sub2 = new Membrane(subhost)

            sub2.addCrux(new PortCrux('a'), 'called');
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.designate('sub.sub:a', 'called')
            expect(desig['sub.sub:a/called']).toBe(sub2.roles.called.a)

            let desigAll = memb.designate('**.sub:a', 'called')
            expect(desigAll['sub.sub:a/called']).toBe(sub2.roles.called.a)
            expect(desigAll['sub:a/called']).toBe(submemb.roles.called.a)
            //expect(desigAll[':a/called']).toBe(memb.roles.called.a)

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
                //console.log(additions)
                expect(scanForToken(additions, 'sub:a/called', 2)[0][0]).toBe(subhost.primary.roles.called.a)
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
        expect('a:p/role'.match(basic)).not.toBeNull();

        let onewild = Designate.designatorToRegex('*:p', 'role');
        expect('a:p/role'.match(onewild)).not.toBeNull();

        let leadingGlob = Designate.designatorToRegex('**.a:*', 'blart');
        expect('globby.glob.blob.a:farts/blart'.match(leadingGlob)).not.toBeNull();

        let multiGlob = Designate.designatorToRegex('**.a.**:p', 'blart');
        expect('globby.a.globby:p/blart'.match(multiGlob)).not.toBeNull();

        let trickyGlob = Designate.designatorToRegex('**.a.**:p', 'blart');
        //console.log('trickyGlob:', trickyGlob);
        expect('globby.a.a.a:p/blart'.match(trickyGlob)).not.toBeNull();

    })


})
