
import {AgentPool} from '../../../agency/all'
import {MockAgent} from '../../helpers/mockAgent'
import TestApp from '../../helpers/testApp'
import {J,j, Domain, Composite, Construct, Junction} from '../../../jungle'


describe('agency', function(){

    it('should pass to each other and not themselves in a pool', function(){

        let pool = new AgentPool({})
        let agent1 = new MockAgent({}, 'extracted1', 'patched1')
        let agent2 = new MockAgent({}, 'extracted2', undefined)

        pool.add(agent1, 'agent1')
        pool.add(agent2, 'agent2')

        let result = agent1.notify('anything')

        expect(agent2.patchSpy).toHaveBeenCalledWith('anything')
        expect(result).toBeUndefined()

        result = agent2.notify('whatever')

        expect(agent1.patchSpy).toHaveBeenCalledWith('whatever')
        expect(result).toEqual({agent1:'patched1'})
    })

    it('should fetch first defined result', function(){
        let pool = new AgentPool({})

        let agent1 = new MockAgent({}, undefined, 'patched1')

        let agent2 = new MockAgent({}, 'defined', 'patched2')

        let agent3 = new MockAgent({}, 'extracted3', 'patched2')

        pool.add(agent1, 'agent1')
        pool.add(agent2, 'agent2')
        pool.add(agent3, 'agent3')

        //    0   100       300
        // 3 -> 1 -> 2 -> return

        let result = agent3.fetch(null)

        expect(agent1.extractSpy).toHaveBeenCalledWith(null)

        expect(result).toBe('defined')
        
    })

    describe('composite integration', function(){

        let domain, cell, mockagent

        beforeAll(function(){
            domain = new Domain()
                .define('host',Composite)
                .define('member', Construct)        

            cell = new TestApp(domain)
            cell.init(j({}))

            mockagent = new MockAgent({}, 'extracted', undefined)

            //adding mock directly(usually done at accessory attachment)
            cell.pool.add(mockagent, 'agent1')
        })

        beforeEach(function(){
            mockagent.reset()
        })

        it('should report patch to other when patch from outside', function(){

            let presult = cell.patch({
                newguy:j('member')
            })

            expect(presult).toBeUndefined();

            expect(cell.subconstructs.newguy instanceof Construct).toBe(true, "new guy has been constructed")

            //after the upwards
            expect(mockagent.patchSpy.calls.first().args[0]).toEqual({
                newguy: {
                    basis:'member',
                    origins:[]
                }
            })
        })

        it('should take notification from above', function(){

            cell.patch({
                hoopla:{
                    basis:'host'
                }
            })

            cell.notify = jasmine.createSpy('out notify')

            let topside = new MockAgent({}, 'extractTop', 'patchTop')
            cell.subconstructs.hoopla.pool.add(topside, 'topside')

            topside.notify({
                uptown:'girl'
            })

            //after the downcoming
            expect(mockagent.patchSpy.calls.mostRecent().args[0]).toEqual({
                hoopla:{
                    uptown:'girl'
                }
            })

            expect(cell.notify).toHaveBeenCalledTimes(1)
        })

        it('should turn set into notify above', function(){

            cell.notify = jasmine.createSpy('out notify')

            cell.exposed.hacked = "invective"

            expect(mockagent.patchSpy.calls.mostRecent().args[0]).toEqual({
                hacked:'invective'
            })

            expect(cell.notify.calls.first().args[0]).toEqual({
                hacked:'invective'
            })

        })

        it('should extract primarily from the substructure but defer to elsewhere when is is unaccessible')


    })

})
