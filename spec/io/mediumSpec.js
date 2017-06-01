
let Jungle = require('../../build/jungle.js');
let Debug = require('../../build/util/debug.js')

let {Membrane, DistributeMedium} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')
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

        contactA = memb.terminals.a
        contactB = memb.terminals.b
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

        let outspy =  jasmine.createSpy();
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
