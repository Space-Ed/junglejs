let Jungle = require('../../dist/jungle.js');
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

        host.populate(['a$', '$b'])

        cruxA = memb.roles.req.a
        cruxB = memb.roles.resp.b
        roleA = cruxA.roles.req
        roleB = cruxB.roles.resp

        exposed = {}

        mesh = new RuleMesh({
            rules:{
                'req->resp':[
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

        cruxB.roles.req.request = (data, crumb)=>{
            let j = new Util.Junction()

            let crumb2 = crumb.drop("final request")
                .with(data)

            j.await(function(done, raise){
                setTimeout(done, 10, {data:data, crumb:crumb2})
            }, false)

            return j
        }

        expect(cruxA.roles.req.request).toBe(cruxB.roles.resp.response)

        cruxA.roles.resp.response("Hello?", crumb).then(({data, crumb})=>{
            let nextCrumb = crumb.drop("Final Response")
                .with(data)

            console.log(nextCrumb.dump())
            expect(data).toEqual("Hello?")
            done()
        })
    })

    describe('dual membrane', function(){
        let host2 = new TestHost();
        let memb2 = host2.primary;

        memb.addSubrane(memb2, "deep");
    })

    it("should allow only single output contacts", function(){


    })
});
