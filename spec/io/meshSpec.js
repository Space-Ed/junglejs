
let Jungle = require('../../dist/jungle.js');
let {Membrane, PortCrux, Crux, RuleMesh} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')


describe('The Mesh Host', function () {

    let host, memb, exposed, mesh, portA, portB, roleA, roleB;

    beforeEach(function () {
        host = new TestHost()

        memb = host.primary

        host.populate(['a_', '_b'])

        portA = memb.roles.source.a
        portB = memb.roles.sink.b
        roleA = portA.roles.source
        roleB = portB.roles.sink

        exposed = {}

        mesh = new RuleMesh({
            rules:{
                'source->sink':[
                    '*:a->*:b',
                ]
            },
            exposed:exposed,
            membranes:{
                m:memb
            }
        })
    })

    it("should connect a to b of a single membrane", function () {

        console.log(mesh)

        let outspy = jasmine.createSpy();

        portB.roles.source.callout = outspy;
        portA.roles.sink.put("Hello?");
        expect(outspy).toHaveBeenCalledWith("Hello?")
    });

    it('Should successfully disconnect when one is removed', function(){

        memb.removeCrux(portB, 'sink')

        console.log(mesh.media['source->sink'].matrix)
        expect(mesh.media['source->sink'].matrix.to['m:a/source']['m:b/sink']).toBeUndefined()

    })

    it('should gracefully connect to an added membrane',function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let m2 = h2.primary;
        let pB2 = m2.roles.sink.b;

        mesh.primary.addSubrane(m2, "m2");

        expect(mesh.media['source->sink'].matrix.to['m:a/source']['m2:b/sink']).not.toBeUndefined();

        let outspy = jasmine.createSpy();
        pB2.roles.source.callout = outspy;

        let outspy2 = jasmine.createSpy();
        portB.roles.source.callout = outspy2;


        portA.roles.sink.put("Hello?");
        expect(outspy).toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")
    })

    it("should gracefully drop connections when subrane disappears", function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let m2 = h2.primary;
        let pB2 = m2.roles.sink.b;

        let h3 = new TestHost();
        h3.populate(['a_']);
        let m3 = h3.primary;
        let pA3 = m3.roles.source.a;


        mesh.primary.addSubrane(m2, "m2");
        mesh.primary.addSubrane(m3, "m3");
        mesh.primary.removeSubrane('m');

        console.log(mesh.media['source->sink'].matrix.from)

        expect(mesh.media['source->sink'].matrix.from['m2:b/sink']['m:a/source']).toBeUndefined();
        expect(mesh.media['source->sink'].matrix.to['m3:a/source']['m:b/sink']).toBeUndefined();

    })

    it('should allow match connection', function(){
        let h2 = new TestHost();
        h2.populate(['_a', 'b_']);
        let m2 = h2.primary;
        let portB2 = m2.roles.source.b;
        let portA2 = m2.roles.sink.a;

        mesh.primary.removeSubrane('m')

        mesh = new RuleMesh({
            membranes:{
                m1:memb,
                m2:m2
            },
            exposed:exposed,
            rules:{
                'source->sink':[
                    'm1:*=>m2:*',
                    'm2:*=>m1:*'
                ]
            }
        })

        let outspy = jasmine.createSpy("1");
        portB.roles.source.callout = outspy;

        let outspy2 = jasmine.createSpy("2");
        portA2.roles.source.callout = outspy2;

        //each calls the corresponding and not the other a -> a2, b2 -> b

        portA.roles.sink.put("Hello?");
        expect(outspy).not.toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")

        outspy.calls.reset();
        outspy2.calls.reset();

        portB2.roles.sink.put("Hola?");
        expect(outspy).toHaveBeenCalledWith("Hola?")
        expect(outspy2).not.toHaveBeenCalledWith("Hola?")


    })
})
