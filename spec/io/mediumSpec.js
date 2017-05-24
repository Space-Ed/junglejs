
let Jungle = require('../../dist/jungle.js');
let Debug = Jungle.Debug;
let {Membrane, PortCrux, Crux, DistributeMedium} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')
Debug.Crumb.defaultOptions.debug = true;
Debug.Crumb.defaultOptions.log = console;

describe("The Push Medium", function () {
    let host, memb, mockmesh, portA, portB, roleA, roleB, medium


    beforeEach(function(){
        host = new TestHost();
        memb = host.primary;

        mockmesh = {
            label:'testMedium', exposed:{}
        }

        host.populate(['a_', '_b'])

        portA = memb.roles.caller.a
        portB = memb.roles.called.b
        roleA = portA.roles.caller
        roleB = portB.roles.called
        medium = new DistributeMedium(mockmesh);

    })

    it('should connect A to B on the same membrane',function(){

        let link = {
            roleA:roleA,
            tokenA:':a/caller',
            roleB:roleB,
            tokenB:':b/called'
        }

        medium.suppose(link)

        let outspy =  jasmine.createSpy();
        portB.roles.caller.func = outspy;

        let crumb = new Debug.Crumb("Beginning")
            .catch((err)=>{
                //console.log("Crumb error caught: ", err.message)
            })

        portA.roles.called.func("Hello?", crumb)

        let final = outspy.calls.allArgs()[0][1]
            .drop("Finished")
            .dump()

        //console.log(final)


        expect(outspy.calls.allArgs()[0][0]).toEqual('Hello?')
    })
});
