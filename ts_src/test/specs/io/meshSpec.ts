
import * as Jungle from '../../../jungle'

let {Membrane, CallIn, CallOut} = Jungle.IO;

import RuleAdapter from '../../helpers/meshAdapter'

import TestHost from '../../helpers/testHost'

let Debug = Jungle.Util.Debug;
Debug.Crumb.defaultOptions.debug = true;
Debug.Crumb.defaultOptions.log = console;

describe('The Mesh Host', function () {

    let host, memb, exposed, mesh, contactA, contactB, meshbrane;

    beforeEach(function () {
        meshbrane = new Membrane()

        host = new TestHost()
        memb = host.primary
        host.populate(['a_', '_b'])

        contactA = memb.contacts.a
        contactB = memb.contacts.b

        exposed = {}

        mesh = new RuleAdapter({
            rules:{
                'distribute':[
                    '*:a->*:b',
                ]
            },
            exposed:exposed,
            membrane:meshbrane
        })

        meshbrane.addSubrane(memb, 'm')

    })

    it("should connect a to b of a single membrane", function () {
        let outspy = jasmine.createSpy('outspy');

        contactB.invert().emit = outspy;
        contactA.invert().put("Hello?");

        expect(outspy.calls.mostRecent().args[0]).toBe("Hello?")
    });

    it('Should successfully disconnect when a crux is removed', function(){

        memb.removeContact('a')
       //console.log(mesh.media['distribute'].matrix)
        expect(mesh.media['distribute'].matrix.to['m:a']['m:b']).toBeUndefined()

    })

    it('should gracefully connect to an added membrane',function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let secondmemb = h2.primary;
        let contact2 = secondmemb.contacts.b;

        meshbrane.addSubrane(secondmemb, "secondmemb");

        expect(mesh.media['distribute'].matrix.to['m:a']['secondmemb:b']).not.toBeUndefined();

        let outspy = jasmine.createSpy("outspy");
        contact2.invert().emit =outspy;

        let outspy2 = jasmine.createSpy("outspy2");
        contactB.invert().emit =outspy2;


        contactA.invert().put("Hello?");
        expect(outspy).toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")
    })

    it("should gracefully drop connections when subrane disappears", function () {
        let h2 = new TestHost();
        h2.populate(['_b']);
        let m2 = h2.primary;
        let contact2 = m2.contacts.b;

        let h3 = new TestHost();
        h3.populate(['a_']);
        let m3 = h3.primary;
        let pA3 = m3.contacts.a;

        meshbrane.addSubrane(m2, "m2");
        meshbrane.addSubrane(m3, "m3");
        meshbrane.removeSubrane('m');

        expect(mesh.media['distribute'].matrix.from['m2:b']['m:a']).toBeUndefined();
        expect(mesh.media['distribute'].matrix.to['m3:a']['m:b']).toBeUndefined();

    })

    it('should allow match connection', function(){
        let h2 = new TestHost();
        h2.populate(['_a', 'b_']);
        let m2 = h2.primary;
        let contactB2 = m2.contacts.b;
        let contactA2 = m2.contacts.a;

        meshbrane.removeSubrane('m')

        meshbrane = new Membrane()
        meshbrane.addSubrane(memb, 'm1')
        meshbrane.addSubrane(m2, 'm2')

        mesh = new RuleAdapter({
            membrane:meshbrane,
            exposed:exposed,
            rules:{
                'distribute':[
                    'm1:*=>m2:*',
                    'm2:*=>m1:*'
                ]
            }
        })

        let outspy = jasmine.createSpy("1");
        contactB.invert().emit =outspy;

        let outspy2 = jasmine.createSpy("2");
        contactA2.invert().emit =outspy2;

        //each calls the corresponding and not the other a -> a2, b2 -> b

        contactA.invert().put("Hello?");
        expect(outspy).not.toHaveBeenCalledWith("Hello?")
        expect(outspy2).toHaveBeenCalledWith("Hello?")

        outspy.calls.reset();
        outspy2.calls.reset();

        contactB2.invert().put("Hola?");
        expect(outspy).toHaveBeenCalledWith("Hola?")
        expect(outspy2).not.toHaveBeenCalledWith("Hola?")

    })

    it('should allow addition and removal of rules ', function(){
        let surface = new Membrane()
        let outer = surface.invert()
        let fabric = new RuleAdapter({
            rules:{
                'distribute':[]
            },
            membrane:surface,
            exposed:{},
        })

        surface.addContact(new CallOut({label:'pointA'}), 'pointA')
        surface.addContact(new CallIn({label:'pointB'}), 'pointB');

        let outspy = jasmine.createSpy('outspy');
        fabric.addRule(':pointA->:pointB','distribute', 'rule1');

        (outer.contacts.pointB).emit = outspy;

        outer.contacts.pointA.put("hello")
        expect(outspy).toHaveBeenCalledWith('hello')

        //improper usage
        expect(function(){
            fabric.removeRule('inject', 'rule1')
        }).toThrowError()

        expect(function(){
            fabric.removeRule('distribute', 'rule2')
        }).toThrowError()

        outspy.calls.reset()

        fabric.removeRule('distribute', 'rule1')

        expect(surface.contacts.pointA.emit).toBeUndefined()
        outer.contacts.pointA.put("hello")
        expect(outspy).not.toHaveBeenCalled()

    })
})
