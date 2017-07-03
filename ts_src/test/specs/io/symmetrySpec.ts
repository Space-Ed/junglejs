
import TestMesh from "../../helpers/meshAdapter";
import TestHost from "../../helpers/testHost";

describe("symmetric linking", function(){

    describe("Bidirected links ", function(){


        it("should create a link in either direction",function(){
            let host = new TestHost()
            let membrane = host.primary;

            let mesh = new TestMesh({
                membrane:membrane,
                rules:{
                    'exchange':[
                        "a<->b"
                    ],
                },
                exposed:{}
            })

            host.populate(['_a_', '_b_'])

            console.log(`membrane.contacts:`,membrane.contacts )

            expect(host.addspy).toHaveBeenCalledTimes(2)


            expect(mesh.hasLinked(':a', ':b')).toBe(true, "has linked a to b")
            expect(mesh.hasLinked(':b', ':a')).toBe(true, "has linked b to a")

        })

    })

})
