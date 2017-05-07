
let Jungle = require('../../dist/jungle.js');
let {Membrane, PortCrux, Crux, RuleMesh} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')


fdescribe('The Mesh Host', function () {

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

    fit('Should successfully disconnect when one is removed', function(){

        memb.removeCrux(portB, 'sink')

        console.log(mesh.media['source->sink'].matrix)
        expect(mesh.media['source->sink'].matrix.to['m:a/source']['m:b/sink']).toBeUndefined()

    })

    fit('should gracefully connect to an added membrane',function () {
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

    });
})
