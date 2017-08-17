
import Jasmine = require('jasmine')
import {MembraneEvents, Section, Membrane} from '../../../interoperability/membranes/membrane'
import {CallIn, CallOut} from '../../../interoperability/contacts/call/common'
import {PushInTrack, PushOutTrack} from '../../helpers/testContacts'

function spyOnSection(section: Section, label:string):jasmine.Spy{
    let spy = jasmine.createSpy(label)

    section.addWatch({
        changeOccurred(event, subject, token){
            spy(event, subject, token)
        }
    })

    return spy
}

describe("sectionalization", function(){

    it('should be able to section a membrane', function(){

        let memb = new Membrane();
        let sect = memb.createSection("**:*");

        memb.addContact( PushInTrack(), "contact")

        let desig = sect.designate(":hi", false)

        expect(desig[':hi']).toBe(memb.contacts.hi)

    })

    it('should notify the section as the membrane is changed', function(){
        let memb = new Membrane();
        let sect = memb.createSection("**:*");
        let addspy = spyOnSection(sect, "sect")

        memb.addContact( PushOutTrack(), "contact")
        expect(addspy).toHaveBeenCalledWith(MembraneEvents.AddContact, memb.contacts.contact, ":contact")

    })

    it('should obscure visibility to the membrane', function(){
        let memb = new Membrane();
        let sect = memb.createSection("**:*");
        let addspy = spyOnSection(memb,"memb")

        memb.addContact( PushOutTrack(), "contact")
        expect(addspy).not.toHaveBeenCalled()
        expect(memb.designate(':contact')[':contact']).toBeUndefined()

    })

    it('should cut into two parts', function(){

        let memb = new Membrane();
        let sect = memb.createSection("a:*");

        let subA = new Membrane()
        let subB = new Membrane()

        memb.addSubrane(subA, 'a')
        memb.addSubrane(subB, 'b')

        let sectspy = spyOnSection(sect, "sect")
        let membspy = spyOnSection(memb, "memb")

        subA.addContact( PushOutTrack(), "aContact")
        subB.addContact( PushOutTrack(), "bContact")

        expect(sectspy).toHaveBeenCalledTimes(1)
        expect(membspy).toHaveBeenCalledTimes(1)

        expect(sect.designate('**:*')['a:aContact']).toBe(subA.contacts.aContact)
        expect(memb.designate('**:*')['b:bContact']).toBe(subB.contacts.bContact)

    })

})
