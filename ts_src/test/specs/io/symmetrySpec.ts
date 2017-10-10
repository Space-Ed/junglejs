
import TestMesh from "../../helpers/meshAdapter";
import TestHost from "../../helpers/testHost";
import {Membrane} from "../../../interoperability/membranes/membrane"

describe("symmetric linking", function(){

    describe("Bidirected links ", function(){

        let host:TestHost, mesh:TestMesh, membrane:Membrane

        beforeEach(function(){
            host = new TestHost(['_a_', '_b_'])

            membrane = host.primary;

            mesh = new TestMesh({
                membrane:membrane,
                media:[
                    'cast'
                ],
                exposed:{},
                laws:{}
            })

        })

        it('has populated the membrane', function(){
            expect(host.addspy).toHaveBeenCalledTimes(2)
        })

        it("should create a link in either direction",function(){
            mesh.addRule(":a<->:b", 'cast')
            expect(mesh.hasLinked(':a', ':b')).toBe(true, "has linked a to b")
            expect(mesh.hasLinked(':b', ':a')).toBe(true, "has linked b to a")
        })

        it("should create a link in only one direction when it is a symmetric rule", function(){
            pending('Definition and Implementation of Symmetric clusters')
            mesh.addRule("a-b", 'direct')
            expect(mesh.hasLinked(':a', ':b')).toBe(true, "has linked a to b")
            expect(mesh.hasLinked(':b', ':a')).toBe(true, "has linked b to a")
        })

    })

})
