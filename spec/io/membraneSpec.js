
let Jungle = require('../../dist/jungle.js');
let {Membrane, PortCrux, Crux} = Jungle.IO;
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
        let newb = new PortCrux('sinkA');
        let new2 = new PortCrux('source1')

        memb.addCrux(newb, 'sink');
        memb.addCrux(new2, 'source');

        expect(memb.roles.sink.sinkA).toBe(newb);
        expect(memb.roles.source.source1).toBe(new2);

        memb.removeCrux(newb, 'sink');
        memb.removeCrux(new2, 'source');

        expect(memb.roles.sink.sinkA).toBeUndefined();
        expect(memb.roles.sink.source1).toBeUndefined();
    })

    describe('designation', function(){
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
        })
        it('populate works', function(){
            expect(memb.roles.sink.a).not.toBeUndefined();
            expect(memb.roles.sink.b).not.toBeUndefined();
            expect(memb.roles.source.y).not.toBeUndefined();
            expect(memb.roles.source.x).not.toBeUndefined();

        })

        it('should designate with direct IR',function(){
            let a = memb.tokenDesignate({
                role:'sink',
                mDesignators:[],
                cDesignator:/.*/
            });

            expect(a[':a/sink'].label).toBe('a')
        })


    })

    describe('inversion', function(){
        let invert;
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
            invert = memb.invert();
        })

        it('should have inverted those cruxes already present', function(){
            let desall = invert.designate(":*", 'sink');

            expect(desall[':y/sink']).not.toBeUndefined();
            expect(desall[':x/sink']).not.toBeUndefined();
        })

        it('should invert further cruxes added', function(){
            memb.addCrux(new PortCrux('lame-o'), 'source');

            let desall = invert.designate(":*", 'sink');
            expect(desall[':lame-o/sink']).not.toBeUndefined();

            //a source in the inversion is a sink in the original
            invert.addCrux(new PortCrux('cool-cat'), 'source');
            let desallop = memb.designate(":*", 'sink');
            expect(desallop[':cool-cat/sink']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.designate(':a','source', false);

            invert.removeCrux(desiga[0],'source');
            expect(invert.designate(':a', "source", false)[0]).toBeUndefined();

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

            let desig = memb.designate('sub:a', 'sink')
            expect(desig['sub:a/sink']).toBe(submemb.roles.sink.a)
        })

        it('globbing should collect at many depths',function(){
            let sub2 = new Membrane(subhost)

            sub2.addCrux(new PortCrux('a'), 'sink');
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.designate('sub.sub:a', 'sink')
            expect(desig['sub.sub:a/sink']).toBe(sub2.roles.sink.a)

            let desigAll = memb.designate('**.sub:a', 'sink')
            expect(desigAll['sub.sub:a/sink']).toBe(sub2.roles.sink.a)
            expect(desigAll['sub:a/sink']).toBe(submemb.roles.sink.a)
            //expect(desigAll[':a/sink']).toBe(memb.roles.sink.a)

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
                console.log(additions)
                expect(scanForToken(additions, 'sub:a/sink', 2)[0][0]).toBe(subhost.primary.roles.sink.a)
            });

            it('should notify me when a membrane is added',function(){
                let membadd = host.membaddspy.calls.allArgs()
                console.log(membadd)
                expect(membadd.length).toEqual(1);
            });

            it('should notify me when a crux is removed from my membrane')
            it('should notify me when a crux is removed from a sub membrane')
            it('should notify me when a sub membrane is added')


        })

    })



    it('shoule converr designator to token regex', function(){
        let basic = Membrane.designatorToRegex('a:p', 'role');
        expect('a:p/role'.match(basic)).not.toBeNull();

        let onewild = Membrane.designatorToRegex('*:p', 'role');
        expect('a:p/role'.match(onewild)).not.toBeNull();

        let leadingGlob = Membrane.designatorToRegex('**.a:*', 'blart');
        expect('globby.glob.blob.a:farts/blart'.match(leadingGlob)).not.toBeNull();

        let multiGlob = Membrane.designatorToRegex('**.a.**:p', 'blart');
        expect('globby.a.globby:p/blart'.match(multiGlob)).not.toBeNull();

        let trickyGlob = Membrane.designatorToRegex('**.a.**:p', 'blart');
        console.log('trickyGlob:', trickyGlob);
        expect('globby.a.a.a:p/blart'.match(trickyGlob)).not.toBeNull();

    })


})
