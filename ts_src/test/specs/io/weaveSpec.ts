
import {Weave} from '../../../interoperability/weave'
import {Law, parseLawExpression} from '../../../interoperability/law'
import {Layer, Membrane} from '../../../interoperability/all'
import {MockMedium} from '../../helpers/mockMedia'
import TestHost from '../../helpers/testHost'

describe('weave', function(){

    let weave:Weave, lining:Layer, host:TestHost, medium:MockMedium, law:Law

     beforeEach(function(){

        host = new TestHost("")
        lining = host.primary
        weave = new Weave({
            target:lining
        })
     })

     describe('Permutability testing', function(){

        let actions = {
            addA(){
                host.populate(['_a'])
            },
            addB() {
                host.populate(['b_'])
            },
            removeA(){
                host.primary.removeContact('a')
            },
            removeB() {
                host.primary.removeContact('b')
            },
            addLaw(){
                law = new Law(parseLawExpression(':a-(link)->:b')[0])
                weave.addLaw(law)
            },
            removeLaw(){
                weave.removeLaw(law)
            },
            addMedium(){
                medium = new MockMedium({
                    fanIn:true, fanOut:true,
                })
                weave.addMedium(medium, 'link')
            },
            removeMedium(){
                weave.removeMedium('link')
            }
        }

        let permutations = [
            ['addA','addB', 'addLaw', 'addMedium'],
            ['addA', 'addB', 'addMedium', 'addLaw'],
            ['addA', 'addMedium','addB', 'addLaw'],
            ['addA', 'addLaw', 'addMedium', 'addB'],
            ['addLaw', 'addA', 'addB', 'addMedium'],
            ['addA','addB', 'addLaw', 'addMedium'],
            ['addLaw', 'addMedium', 'addA', 'addB'],
        ]

        let removals = [
            'removeA',
            'removeB',
            'removeLaw',
            'removeMedium'                
        ]

        for (let run of permutations){
            it('should create a link when additions in order: '+run.join(' -> '), function(){
                for(let act of run){
                    actions[act]()
                }
                expect(medium.connect).toHaveBeenCalledTimes(1)
            })

        }
        
        for (let removal of removals){
            it(`action: ${removal} should cause disconnection`, function(){
                for (let act of permutations[0]) {
                    actions[act]()
                }

                actions[removal]()
                    
                let Abreak = (<jasmine.Spy>medium.retractSeat).calls.count()
                let Bbreak = (<jasmine.Spy>medium.retractTarget).calls.count()

                expect(Abreak).toBeLessThan(2)
                expect(Abreak).toBeLessThan(2)
                expect(Abreak+Bbreak).toBeGreaterThan(0)
            })  

        }


     })

})