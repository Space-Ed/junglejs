import * as Jungle from '../../../jungle';
import * as Debug from '../../../util/debug'
import TestHost from '../../helpers/testHost'

let {Membrane, DistributeMedium} = Jungle.IO;
Debug.Crumb.defaultOptions.debug = true;
Debug.Crumb.defaultOptions.log = console;

describe("The Push Medium", function () {
    let host, memb, mockmesh, contactA, contactB, medium


    beforeEach(function(){
        host = new TestHost();
        memb = host.primary;

        mockmesh = {
            label:'testMedium', exposed:{}
        }

        host.populate(['a_', '_b'])

        contactA = memb.contacts.a
        contactB = memb.contacts.b
        medium = new DistributeMedium(mockmesh);

    })

    it('should connect A to B on the same membrane',function(){

        let link = {
            contactA:contactA,
            tokenA:':a',
            contactB:contactB,
            tokenB:':b'
        }

        medium.suppose(link)

        let outspy = jasmine.createSpy("output catch");

        contactB.invert().emit = outspy;

        let crumb = new Debug.Crumb("Beginning")
            .catch((err)=>{
               //console.log("Crumb error caught: ", err.message)
            })

        contactA.invert().put("Hello?", crumb)

        let final = outspy.calls.allArgs()[0][1]
            .drop("Finished")
            .dump()

        expect(outspy.calls.allArgs()[0][0]).toEqual('Hello?')
    })
});
