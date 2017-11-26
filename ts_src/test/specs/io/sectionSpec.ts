
import Jasmine = require('jasmine')
import {Section, Layer, Membrane} from '../../../interoperability/all'
import {compileToken} from '../../../util/designation/parsing'
import {Duplex as Contact} from '../../helpers/testContacts'


function spyOnSection(section: Layer, label:string):jasmine.Spy{
    let spy = jasmine.createSpy(label)

    section.addWatch({
        contactChange(token, contact){
            spy(token, contact)
        }
    })

    return spy
}

describe("sectionalization", function(){

    it('should be able to section a membrane', function(){

        let memb = new Membrane();

        
        memb.addContact(Contact(), "pre")

        let sect = memb.createSection("**:*");
        
        memb.addContact(Contact(), "post")


        let notThere = sect.scan(":hi", true)
        expect(notThere[':hi']).toBeUndefined()
        
        let thereBefore = sect.scan(":pre", true)
        expect(thereBefore[':pre']).toBe(memb.contacts.pre)
        

        let addedAfter = sect.scan(":post", true)
        expect(addedAfter[':post']).toBe(memb.contacts.post)
    })

    it('should notify the section as the membrane is changed', function(){
        let memb = new Membrane();
        
        let sect = memb.createSection("**:*");

        memb.addContact(Contact(), "pre")

        let addspy = spyOnSection(sect, "sect")

        memb.addContact( Contact(), "post")

        expect(addspy.calls.allArgs()[0][0]).toEqual([[],"pre"])
        expect(addspy.calls.allArgs()[1][0]).toEqual([[],"post"])

    })

    it('should create negative section for designator', function(){
        let memb = new Membrane();

        memb.addContact(Contact(), "pre")

        //a section containing everything except everything
        let sect = memb.createSection("**:*", null, false);
        let addspy = spyOnSection(sect, "negative")

        memb.addContact( Contact(), "contact")

        expect(addspy).not.toHaveBeenCalled()
        expect(sect.scan(':contact')[':contact']).toBeUndefined()
        expect(sect.scan(':pre')[':pre']).toBeUndefined()

    })

    describe('systematic', function(){

        let memb:Membrane, subA:Membrane, subB:Membrane
     
        beforeEach(function(){
            memb = new Membrane();

            subA = new Membrane()
            subB = new Membrane()

            memb.addSubrane(subA, 'a')
            memb.addSubrane(subB, 'b')

            subA.addContact(Contact(), "A")
            subA.addContact(Contact(), "B")
            subB.addContact(Contact(), "B")
            subB.addContact(Contact(), "C")
            memb.addContact(Contact(), "A")
            memb.addContact(Contact(), "C")
        })

        function removal(){
            memb.removeSubrane('b')
            // subB.removeContact('B')
            // subB.removeContact('C')
            subA.removeContact('A')
            subA.removeContact('B')
            memb.removeContact('A')
            memb.removeContact('C')
        }

        const complete = ['a:A', 'a:B', 'b:B', 'b:C', ':A', ':C']
        const tests = [
            ['**:*', ['a:A', 'a:B', 'b:B', 'b:C', ':A', ':C']],
            ['*:*', ['a:A', 'a:B', 'b:B', 'b:C']],
            ['*:B', [ 'a:B', 'b:B']],
            ['a:*', ['a:A', 'a:B']],
            ['**:C', [':C', 'b:C']],
            [':*', [':A', ':C']],
        ]
        
        for (let [sectd, positive] of tests){

            it(`should create scannable positive and negative section for ${sectd}`, function(){
                let sect = memb.createSection(<string>sectd)
                let neg = memb.createSection(<string>sectd, null, false)
                let scan = sect.scan('**:*', true)
                let nscan = neg.scan('**:*', true)

                for (let token of complete){

                    if(positive.indexOf(token) > -1){
                        expect(token in scan).toBe(true, `positive scan should contain ${token}`)
                    }else{
                        expect(token in nscan).toBe(true, `negative scan should contain ${token}`)
                    }
                }
            })

            it(`watching the section should notify for each existing contact ${sectd}`, function(){
                let sect = memb.createSection(<string>sectd)
                let neg = memb.createSection(<string>sectd, null, false)

                let pcalls = new Set()
                let ncalls = new Set()

                sect.addWatch({
                    contactChange(token, contact){
                        let c = compileToken(token)
                        pcalls.add(c)
                    }
                })

                neg.addWatch({
                    contactChange(token, contact) {
                        let c = compileToken(token)
                        ncalls.add(c)
                    }
                })

                for (let token of complete) {

                    if (positive.indexOf(token) > -1) {
                        expect(pcalls.has(token)).toBe(true, `positive scan should contain ${token}`)
                    } else {
                        expect(ncalls.has(token)).toBe(true, `negative scan should contain ${token}`)
                    }
                }
            })

            it(`should respond to the removal of things`, function(){
    
                let sect = memb.createSection(<string>sectd)
                let neg = memb.createSection(<string>sectd, null, false)
                
                removal()
    
                expect(Object.keys(sect.scan('**:*', true)).length).toBe(0, "there are no things left to scan")
                expect(Object.keys(neg.scan('**:*', true)).length).toBe(0, 'nothing negative left to scan')                
    
            })
        }
        

    })

})
