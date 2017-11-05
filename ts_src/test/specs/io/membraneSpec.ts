import * as Jungle from '../../../jungle'

let Membrane = Jungle.Membrane;
import TestHost from '../../helpers/testHost'
import {Input, Output} from '../../helpers/testContacts'

describe('basic membrane', function(){

    let memb, host;

    beforeEach(function(){
        host =  new TestHost([])
        memb = host.primary
    })

    afterEach(function(){
    })

    it('should allow addition and removal of ports', function(){
        let newb = Input()
        let new2 = Output()

        memb.addContact( newb, 'calledA');
        memb.addContact( new2, 'caller1');

        expect(memb.contacts.calledA).toBe(newb);
        expect(memb.contacts.caller1).toBe(new2);

        memb.removeContact("calledA");
        memb.removeContact("caller1");

        expect(memb.contacts.calledA).toBeUndefined();
        expect(memb.contacts.caller1).toBeUndefined();
    })
    describe('designation', function(){
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('populate works', function(){
            expect(memb.contacts.a).not.toBeUndefined();
            expect(memb.contacts.b).not.toBeUndefined();
            expect(memb.contacts.y).not.toBeUndefined();
            expect(memb.contacts.x).not.toBeUndefined();

        })
    })
    describe('inversion', function(){
        let invert;
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
            invert = memb.invert();
        })

        it('should have inverted those contactes already present', function(){
            let desall = invert.scan(":*");

            expect(desall[':y']).not.toBeUndefined();
            expect(desall[':x']).not.toBeUndefined();
        })

        it('should invert further contactes added', function(){
            memb.addContact(Output(), 'lame-o');

           //
            let desall = invert.scan(":*");

            expect(desall[':lame-o']).not.toBeUndefined();

            //a caller in the inversion is a called in the original
            invert.addContact(Output(), 'cool-cat');
            let desallop = memb.scan(":*");
            expect(desallop[':cool-cat']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.scan(':a', false);

            invert.removeContact(desiga[0]);
            expect(invert.scan(':a',  false)[0]).toBeUndefined();
        })

    })
    describe('nested membranes', function(){
        let subhost, submemb

        beforeEach(function(){
            subhost = new TestHost([])

            submemb = subhost.primary;
            memb.addSubrane(submemb, 'sub')

            subhost.populate(['_a','x_']);
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('should allow designation at depth', function(){

            let desig = memb.scan('sub:a')
            expect(desig['sub:a']).toBe(submemb.contacts.a)
        })

        it('globbing should collect at many depths',function(){
            let sub2 = new Membrane()

            sub2.addContact(Input() , 'a');
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.scan('sub.sub:a')
            //
            expect(desig['sub.sub:a']).toBe(sub2.contacts.a)

            let desigAll = memb.scan('**.sub:a')
            expect(desigAll['sub.sub:a']).toBe(sub2.contacts.a)
            expect(desigAll['sub:a']).toBe(submemb.contacts.a)

        })


    })
    describe('- membrane change notifications', function(){

        beforeEach(function(){

        })

        //when ports are added the host of the membrane and all parent membranes is informed
        it('should notify host when membrane has a contact added',function(){
            //all additions reported
            host.populate(['_door']);
            expect(host.addspy.calls.allArgs()[0][1]).toBe(memb.contacts.door)
            expect(host.addspy.calls.allArgs()[0][0]).toEqual([[],'door'])
        });

        it('should notify when a sub membrane has a contact added',function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            sub.addContact(Input(), 'piwi')

            expect(host.addspy.calls.allArgs()[0][1]).toBe(sub.contacts.piwi)
            expect(host.addspy.calls.allArgs()[0][0]).toEqual([['sub'], 'piwi'])
        });


        it('should notify me when a contact is removed from my membrane',function(){
            host.populate(['_door']);
            let removed = memb.contacts.door
            memb.removeContact('door');

            expect(memb.contacts.door).toBeUndefined()
            expect(host.remspy.calls.allArgs()[0][0]).toEqual([[],'door'])
        })

        it('should notify me when a contact is removed from a sub membrane',function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            sub.addContact(Input(),'piwi')

            let removed = sub.removeContact('piwi')

            expect(memb.contacts.door).toBeUndefined()
            expect(host.remspy.calls.allArgs()[0][0]).toEqual([['sub'], 'piwi'])
        })

        it('should notify contact additions of an added sub membrane', function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            let sub2 = new Membrane()
            sub2.addContact(Output(),'fogle')

            sub.addSubrane(sub2, 'sub2')

            expect(host.addspy.calls.allArgs()[0][1]).toBe(sub2.contacts.fogle)
            expect(host.addspy.calls.allArgs()[0][0]).toEqual([['sub','sub2'],'fogle'])
        })
    })

    describe('with anonymity', function(){

        it('should allow anonymous watch with numeric indicies',function(){

            let memb = new Membrane()

            function check(ev, ct, token){//console.log('change occurred with token ', token)
            }

            let changeSpy = jasmine.createSpy('change on anon').and.callFake(check)
            let indexSpy = jasmine.createSpy('change on index').and.callFake(check)

            memb.addWatch({
                contactChange:changeSpy
            })


            memb.addWatch({
                contactChange:indexSpy
            }, 0)

            let contact = Input()
            memb.addContact(contact, 'twice')

            expect(changeSpy.calls.allArgs()[0][0]).toEqual([[],'twice'], "because anonymous wipes the front")

            expect(indexSpy.calls.allArgs()[0][0]).toEqual([['0'],'twice'], "because numeric designation is allowed")

        })
    })

})
