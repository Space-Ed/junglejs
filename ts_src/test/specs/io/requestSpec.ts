import* as Jungle from '../../../jungle'
import TestHost from '../../helpers/testHost'

let {Util} = Jungle;
let Debug = Util.Debug
let {Membrane, RuleMesh} = Jungle.IO;


describe("request medium and cruxes", function () {

    let host, memb, exposed, mesh, meshOutlet, meshInlet;

    beforeEach(function () {

        Debug.Crumb.defaultOptions.debug = true;
        Debug.Crumb.defaultOptions.log = console;
        Debug.Crumb.defaultOptions.format =Debug.dumpToDepthF(2);

        host = new TestHost()

        memb = host.primary
        memb.invert()

        host.populate(['a_', '_b'])

        meshOutlet = memb.contacts.a;
        meshInlet = memb.contacts.b;

        exposed = {}

        let meshbrane = new Membrane()
        meshbrane.addSubrane(memb, 'm')

        mesh = new RuleMesh({
            rules:{
                'direct':[
                    '*:a->*:b',
                ]
            },
            exposed:exposed,
            membrane:meshbrane
        })
        
    })

    it("should pass asynchronous requests", function(done){

        let crumb = new Debug.Crumb("Initial")

        crumb.at('Pretest')

        //Request Terminal
        meshInlet.invert().emit = (data, crumb)=>{
            let j = new Util.Junction()

            let crumb2 = crumb.drop("final request")
                .with(data)

            j.await(function(done, raise){
                setTimeout(done, 10, {data:data, crumb:crumb2})
            }, false)

            return j
        }

        expect(meshOutlet.emit).toBe(meshInlet.put)

        //Request Entry
        meshOutlet.invert().put("Hello?", crumb).then(({data, crumb})=>{
            let nextCrumb = crumb.drop("Final Response")
                .with(data)
                .catch(err =>{//console.log(err.message)
                })

           //console.log(nextCrumb.dump())
            expect(data).toEqual("Hello?")
            done()
        }).catch((err)=>{//console.log(err.message);
            done();
        })


    })

    it("should allow only single output contacts", function(){


    })
});
