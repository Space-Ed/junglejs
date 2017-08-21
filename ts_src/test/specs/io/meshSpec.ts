
import * as Jungle from '../../../jungle'
import {Membrane} from '../../../interoperability/membranes/membrane'
import RuleAdapter from '../../helpers/meshAdapter'
import TestHost from '../../helpers/testHost'
import {Input, Output} from '../../helpers/testContacts'

let Debug = Jungle.Util.Debug;
Debug.Crumb.defaultOptions.debug = true;
Debug.Crumb.defaultOptions.log = console;

describe('The Mesh Host', function () {

    let host:TestHost, memb:Membrane, exposed, mesh:RuleAdapter, contactA, contactB, meshbrane;

    describe('basic',function(){

        beforeEach(function () {
            host = new TestHost(['_a'])

            mesh = new RuleAdapter({
                membrane:host.primary,
                exposed:exposed,
                media:['direct'],
                laws:{
                    'direct':[
                        ':a->**:*'
                    ]
                }
            })

        })

        it('Should successfully disconnect when a contact is removed', function(){
            host.primary.addContact(Output(), 'b')
            expect(mesh.hasLinked(':a',':b')).toBe(true)
            host.primary.removeContact('a')
            expect(mesh.hasLinked(':a',':b')).toBe(false)
        })

        it('should gracefully connect and disconnect to an added membrane',function () {

            let m2 = new Membrane()
            let m2inv = m2.invert()

            m2.addContact(Output(),'c')

            host.primary.addSubrane(m2, 'sub')
            expect(mesh.hasLinked(':a','sub:c')).toBe(true)
            host.primary.removeSubrane('sub')
            expect(mesh.hasLinked(':a','sub:c')).toBe(false)
        })

    })

    it('should allow match connection', function(){
        let h1 = new TestHost(['_a', '_b']);
        let h2 = new TestHost(['a_', 'b_']);

        meshbrane = new Membrane()
        meshbrane.addSubrane(h1.primary, 'm1')
        meshbrane.addSubrane(h2.primary, 'm2')

        mesh = new RuleAdapter({
            membrane:meshbrane,
            exposed:exposed,
            media:['direct'],
            laws:{
                'direct':[
                    '*:Z#->*:Z#'
                ]
            }
        })

        //each calls the corresponding and not the other a -> a2, b2 -> b
        expect(mesh.hasLinked('m1:a', 'm2:a')).toBe(true, 'should have created link a -> a')
        expect(mesh.hasLinked('m1:b', 'm2:b')).toBe(true, 'should have created link b -> b')
        expect(mesh.hasLinked('m1:a', 'm2:b')).toBe(false, 'shoule not have created link a-> b')
        expect(mesh.hasLinked('m1:b', 'm2:a')).toBe(false, 'shoule not have created link b -> a')


    })

    it('should allow addition and removal of rules ', function(){
        let host = new TestHost(['_pointA','pointB_'])
        let surface = host.primary
        let outer = host.invert

        let fabric = new RuleAdapter({
            media:['smear'],
            laws:{},
            membrane:surface,
            exposed:{},
        })

        let outspy = jasmine.createSpy('outspy');
        fabric.addRule(':pointA->:pointB','smear', 'rule1');

        (outer.contacts.pointB).emit = outspy;

        outer.contacts.pointA.put("hello")
        expect(outspy.calls.first().args[0]).toBe('hello')

        //improper usage

        //rule does not exist
        expect(function(){
            fabric.removeRule('inject', 'rule1')
        }).toThrowError()

        expect(function(){
            fabric.removeRule('smear', 'rule2')
        }).toThrowError()

        outspy.calls.reset()

        fabric.removeRule('smear', 'rule1')

        expect(surface.contacts.pointA.emit).toBeUndefined()
        outer.contacts.pointA.put("hello")
        expect(outspy).not.toHaveBeenCalled()

    })
})
