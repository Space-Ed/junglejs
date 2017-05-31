
let Jungle = require('../../build/jungle.js');
let {Membrane, PortCrux, Crux, RuleMesh} = Jungle.IO;

let TestHost = require('../helpers/testHost.js')


let Debug = Jungle.Util.Debug;
Debug.Crumb.defaultOptions.debug = true;
Debug.Crumb.defaultOptions.log = console;

describe('The Mesh Host', function () {

    let host, memb, exposed, mesh, portA, portB, roleA, roleB;

    beforeEach(function () {


        host = new TestHost()

        memb = host.primary

        host.populate(['a_', '_b'])

        portA = memb.roles.caller.a
        portB = memb.roles.called.b
        roleA = portA.roles.caller
        roleB = portB.roles.called

        exposed = {}

        mesh = new RuleMesh({
            rules:{
                'distribute':[
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
        let outspy = jasmine.createSpy();

        portB.roles.caller.func = outspy;
        portA.roles.called.func("Hello?");
        expect(outspy.calls.mostRecent().args[0]).toBe("Hello?")
    });

    it('Should successfully disconnect when a crux is removed', function(){

        memb.removeCrux(portB, 'called')
        //console.log(mesh.media['distribute'].matrix)
        expect(mesh.media['distribute'].matrix.to['m:a/caller']['m:b/called']).toBeUndefined()

    })

    it('should gracefully connect to an added membrane',function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let m2 = h2.primary;
        let pB2 = m2.roles.called.b;

        mesh.primary.addSubrane(m2, "m2");

        expect(mesh.media['distribute'].matrix.to['m:a/caller']['m2:b/called']).not.toBeUndefined();

        let outspy = jasmine.createSpy();
        pB2.roles.caller.func = outspy;

        let outspy2 = jasmine.createSpy();
        portB.roles.caller.func = outspy2;


        portA.roles.called.func("Hello?");
        expect(outspy).toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")
    })

    it("should gracefully drop connections when subrane disappears", function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let m2 = h2.primary;
        let pB2 = m2.roles.called.b;

        let h3 = new TestHost();
        h3.populate(['a_']);
        let m3 = h3.primary;
        let pA3 = m3.roles.caller.a;


        mesh.primary.addSubrane(m2, "m2");
        mesh.primary.addSubrane(m3, "m3");
        mesh.primary.removeSubrane('m');

        expect(mesh.media['distribute'].matrix.from['m2:b/called']['m:a/caller']).toBeUndefined();
        expect(mesh.media['distribute'].matrix.to['m3:a/caller']['m:b/called']).toBeUndefined();

    })

    it('should allow match connection', function(){
        let h2 = new TestHost();
        h2.populate(['_a', 'b_']);
        let m2 = h2.primary;
        let portB2 = m2.roles.caller.b;
        let portA2 = m2.roles.called.a;

        mesh.primary.removeSubrane('m')

        mesh = new RuleMesh({
            membranes:{
                m1:memb,
                m2:m2
            },
            exposed:exposed,
            rules:{
                'distribute':[
                    'm1:*=>m2:*',
                    'm2:*=>m1:*'
                ]
            }
        })

        let outspy = jasmine.createSpy("1");
        portB.roles.caller.func = outspy;

        let outspy2 = jasmine.createSpy("2");
        portA2.roles.caller.func = outspy2;

        //each calls the corresponding and not the other a -> a2, b2 -> b

        portA.roles.called.func("Hello?");
        expect(outspy).not.toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")

        outspy.calls.reset();
        outspy2.calls.reset();

        portB2.roles.called.func("Hola?");
        expect(outspy).toHaveBeenCalledWith("Hola?")
        expect(outspy2).not.toHaveBeenCalledWith("Hola?")

    })
})
