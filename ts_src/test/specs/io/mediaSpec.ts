
import {MockMedium, MockMediumSpec} from '../../helpers/mockMedia'
import {Duplex,Input, Output} from '../../helpers/testContacts'
import {Call} from '../../../interoperability/contacts/call'
import {Law, parseLawExpression} from '../../../interoperability/law'
import {MediumConsumed} from '../../../interoperability/media/base'
import TestHost from '../../helpers/testHost'

describe('media', function(){

    it('should establish a connection', function(){

        let medium:MediumConsumed = new MockMedium({
            fanIn:false, fanOut:true, seatType:Call, targetType:Call
        })

        let mockLaw:any = {};

        expect(medium.hasClaim('a')).toBe(false);
        expect(medium.hasClaim('b')).toBe(false);

        medium.claimSeat("a", Input(), mockLaw);
        medium.claimTarget('b', Output(), mockLaw);

        expect(medium.hasClaim('a')).toBe(true);
        expect(medium.hasClaim('b')).toBe(true);

        expect(medium.hasLink('a','b')).toBe(false);
        medium.supposeLink({seatToken:'a', targetToken:'b', bindings:{}}, mockLaw);
        expect(medium.hasLink('a','b')).toBe(true);
        
        medium.revokeLink({ seatToken: 'a', targetToken: 'b', bindings: {} }, mockLaw);
        expect(medium.hasLink('a','b')).toBe(false);
        
        medium.supposeLink({ seatToken: 'a', targetToken: 'b', bindings: {} }, mockLaw);
        expect(medium.hasLink('a','b')).toBe(true);
        
        medium.dropSeat('a', mockLaw)
        expect(medium.hasLink('a','b')).toBe(false);
        expect(medium.hasClaim('a')).toBe(false)
        
        medium.dropSeat('b', mockLaw)
        expect(medium.hasClaim('b')).toBe(false)
    })
 
})

describe('law - media - layer integration', function(){

    let medium = new MockMedium({
        fanIn: false, fanOut: true, seatType: Call, targetType: Call
    })

    let lawIR = parseLawExpression(':a->:b', 'medium')
    let law = new Law(lawIR[0])

    let host = new TestHost([
        '_a', 'b_'
    ])

    law.engage(host.primary, medium)
})