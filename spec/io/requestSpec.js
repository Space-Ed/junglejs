let Jungle = require('../../build/jungle.js');
let {Debug, Util} = Jungle;
let {Membrane, PortCrux, Crux, RuleMesh, RequestCrux} = Jungle.IO;
let TestHost = require('../helpers/testHost.js')


describe("request medium and cruxes", function () {

    let host, memb, exposed, mesh, cruxA, cruxB, roleA, roleB;

    beforeEach(function () {

        Debug.Crumb.defaultOptions.debug = true;
        Debug.Crumb.defaultOptions.log = console;
        Debug.Crumb.defaultOptions.format =Debug.dumpToDepthF(2);

        host = new TestHost()

        memb = host.primary

        host.populate(['a_', '_b'])

        cruxA = memb.roles.caller.a
        cruxB = memb.roles.called.b
        roleA = cruxA.roles.caller
        roleB = cruxB.roles.called

        exposed = {}

        mesh = new RuleMesh({
            rules:{
                'inject':[
                    '*:a->*:b',
                ]
            },
            exposed:exposed,
            membranes:{
                m:memb
            }
        })
    })

    it("should pass asynchronous requests", function(done){

        let crumb = new Debug.Crumb("Initial")

        crumb.at('Pretest')

        //Request Terminal
        cruxB.roles.caller.func = (data, crumb)=>{
            let j = new Util.Junction()

            let crumb2 = crumb.drop("final request")
                .with(data)

            j.await(function(done, raise){
                setTimeout(done, 10, {data:data, crumb:crumb2})
            }, false)

            return j
        }

        expect(cruxA.roles.caller.func).toBe(cruxB.roles.called.func)

        //Request Entry
        cruxA.roles.called.func("Hello?", crumb).then(({data, crumb})=>{
            let nextCrumb = crumb.drop("Final Response")
                .with(data)

            //console.log(nextCrumb.dump())
            expect(data).toEqual("Hello?")
            done()
        })
    })

    it("should allow only single output contacts", function(){


    })
});
