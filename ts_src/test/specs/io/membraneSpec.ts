import * as Jungle from '../../../jungle'

let {Membrane, CallOut, CallIn} = Jungle.IO;
import TestHost from '../../helpers/testHost'

describe('basic membrane', function(){

    let memb, host;

    beforeEach(function(){
        host =  new TestHost()
        memb = host.primary
    })

    afterEach(function(){
    })

    it('should allow addition and removal of ports', function(){
        let newb = new CallIn({label: 'calledA'});
        let new2 = new CallOut({label: 'caller1'})

        memb.addContact('calledA', newb);
        memb.addContact('caller1', new2);

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
            let desall = invert.designate(":*");

            expect(desall[':y']).not.toBeUndefined();
            expect(desall[':x']).not.toBeUndefined();
        })

        it('should invert further contactes added', function(){
            memb.addContact('lame-o',new CallOut({label:'lame-o'}));

            //console.log(invert.contacts)
            let desall = invert.designate(":*");

            expect(desall[':lame-o']).not.toBeUndefined();

            //a caller in the inversion is a called in the original
            invert.addContact('cool-cat',new CallOut({label:'cool-cat'}));
            let desallop = memb.designate(":*");
            expect(desallop[':cool-cat']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.designate(':a', false);

            invert.removeContact(desiga[0]);
            expect(invert.designate(':a',  false)[0]).toBeUndefined();
        })

    })
    describe('nested membranes', function(){
        let subhost, submemb

        beforeEach(function(){
            subhost = new TestHost()

            submemb = subhost.primary;
            memb.addSubrane(submemb, 'sub')

            subhost.populate(['_a','x_']);
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        it('should allow designation at depth', function(){

            let desig = memb.designate('sub:a')
            expect(desig['sub:a']).toBe(submemb.contacts.a)
        })

        it('globbing should collect at many depths',function(){
            let sub2 = new Membrane(subhost)

            sub2.addContact('a', new CallIn({label:'a'}));
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.designate('sub.sub:a')
            //
            expect(desig['sub.sub:a']).toBe(sub2.contacts.a)

            let desigAll = memb.designate('**.sub:a')
            expect(desigAll['sub.sub:a']).toBe(sub2.contacts.a)
            expect(desigAll['sub:a']).toBe(submemb.contacts.a)

        })


    })
    describe('membrane change notifications', function(){

        beforeEach(function(){

        })

        //when ports are added the host of the membrane and all parent membranes is informed
        it('should notify host when membrane has a contact added',function(){
            //all additions reported
            host.populate(['_door']);
            expect(host.addspy.calls.allArgs()[0][0]).toBe(memb.contacts.door)
            expect(host.addspy.calls.allArgs()[0][1]).toBe(':door')
        });

        it('should notify me when a membrane is added',function(){
            let sub = new Membrane()

            memb.addSubrane(sub, 'sub')

            let membadd = host.membaddspy.calls.allArgs()
            expect(host.membaddspy.calls.allArgs()[0][0]).toBe(sub)
        });

        it('should notify when a sub membrane has a contact added',function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            sub.addContact('piwi', new CallIn({
                label:'piwi'
            }))

            expect(host.addspy.calls.allArgs()[0][0]).toBe(sub.contacts.piwi)
            expect(host.addspy.calls.allArgs()[0][1]).toBe('sub:piwi')
        });


        it('should notify me when a contact is removed from my membrane',function(){
            host.populate(['_door']);
            let removed = memb.contacts.door
            memb.removeContact('door');

            expect(memb.contacts.door).toBeUndefined()
            expect(host.remspy.calls.allArgs()[0][0]).toBe(removed)
            expect(host.remspy.calls.allArgs()[0][1]).toBe(':door')
        })

        it('should notify me when a contact is removed from a sub membrane',function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            sub.addContact('piwi', new CallIn({
                label:'piwi'
            }))

            let removed = sub.removeContact('piwi')

            expect(memb.contacts.door).toBeUndefined()
            expect(host.remspy.calls.allArgs()[0][0]).toBe(removed)
            expect(host.remspy.calls.allArgs()[0][1]).toBe('sub:piwi')
        })

        it('should notify me when a sub membrane is added',function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            host.membaddspy.calls.reset();
            let sub2 = new Membrane()
            sub.addSubrane(sub2, 'sub2')

            expect(host.membaddspy.calls.allArgs()[0][0]).toBe(sub2)
            expect(host.membaddspy.calls.allArgs()[0][1]).toBe('sub.sub2')
        })

        it('should notify contact additions of an added sub membrane', function(){
            let sub = new Membrane()
            memb.addSubrane(sub, 'sub')

            host.membaddspy.calls.reset();

            let sub2 = new Membrane()
            sub2.addContact('fogle', new CallOut({
                label:'fogle'
            }))

            sub.addSubrane(sub2, 'sub2')

            expect(host.addspy.calls.allArgs()[0][0]).toBe(sub2.contacts.fogle)
            expect(host.addspy.calls.allArgs()[0][1]).toBe('sub.sub2:fogle')
        })
    })

})
