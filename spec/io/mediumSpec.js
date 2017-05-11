
let Jungle = require('../../dist/jungle.js');
let {Membrane, PortCrux, Crux, PushMedium} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')

describe("The Push Medium", function () {
    let host, memb, mockmesh, portA, portB, roleA, roleB, medium


    beforeEach(function(){
        host = new TestHost();
        memb = host.primary;
        mockmesh = {
            label:'testMedium', exposed:{}
        }

        host.populate(['a_', '_b'])

        portA = memb.roles.source.a
        portB = memb.roles.sink.b
        roleA = portA.roles.source
        roleB = portB.roles.sink
        medium = new PushMedium(mockmesh);

    })

    it('should connect A to B on the same membrane',function(){

        let link = {
            roleA:roleA,
            tokenA:':a/source',
            roleB:roleB,
            tokenB:':b/sink'
        }

        medium.suppose(link)

        let outspy =  jasmine.createSpy();
        portB.roles.source.callout = outspy;

        portA.roles.sink.put("Hello?")

        expect(outspy).toHaveBeenCalledWith('Hello?')
    })
});
