import {parseLawExpression, Law, LawIR} from '../../../interoperability/law'
import * as MUX  from '../../../interoperability/media/multiplexing'
import TestHost from '../../helpers/testHost'
import {MockMedium} from '../../helpers/mockMedium'

describe('law parsing', function(){

    it('should parse a single simple rule', function(){
        let parsed = parseLawExpression('a:b->c:d', 'medium')
        expect(parsed[0].designatorA).toBe('a:b')
        expect(parsed[0].designatorB).toBe('c:d')
    })

    it('should parse matching rules', function(){
        let parsed = parseLawExpression('a:symbo#{fe,fi,fo}=>captain:deranged', 'medium')
        expect(parsed[0].designatorA).toBe('a:symbo#{fe,fi,fo}')
        expect(parsed[0].designatorB).toBe('captain:deranged')
        expect(parsed[0].matching).toBe(true)
    })

    it('should parse medium in middle',function(){
        let parsed = parseLawExpression('nz:wellington=(byair)=>aus:Melbourne')
        expect(parsed[0].designatorA).toBe('nz:wellington')
        expect(parsed[0].designatorB).toBe('aus:Melbourne')
        expect(parsed[0].medium).toBe('byair')
    })

    it('should parse chain link rules', function(){
        let parsed = parseLawExpression('nz:wellington =(byair)=> aus:Melbourne -(byboat)-> usa:hawaii =(bytube)=> usa:sanfran')
        expect(parsed.length).toBe(3)
        
    })

})

describe('laws in action', function(){

    let medium:MockMedium, host:TestHost, hostA:TestHost, hostB:TestHost

    beforeEach(()=>{
        host = new TestHost('what')
        hostA = new TestHost('hostA')
        hostB = new TestHost('hostB')
        host.primary.addSubrane(hostA.primary, 'a')
        host.primary.addSubrane(hostB.primary, 'b')
        medium = new MockMedium({

        })
    })

    function connectionTest(expression, acontacts, bcontacts, connections){
        let lawIR = parseLawExpression(expression, 'medium')
        
        let law = new Law(lawIR[0])
    
        law.engage(host.primary, medium)
    
        expect(law.medium).toBe(medium)
    
        hostA.populate(acontacts);
        hostB.populate(bcontacts);
    
        let calls = (<jasmine.Spy>medium.suppose).calls.allArgs()

        for (let [tokenA, tokenB] of connections){
            let matches = calls.filter(([val], i)=>{
                return val.tokenA == tokenA && val.tokenB == tokenB
            })

            //only one connection of each kind 
            expect(matches.length).toBe(1)
        }

        
    }

    it('should connect A to B ', function(){
        connectionTest('a:c->b:c', ['_c'], ['c_'], [['a:c','b:c']])
    })

    it('should connect by symbolic bridge', function(){
        connectionTest('a:x#->b:x#', ['_c', '_a'], ['c_', 'a_'], [['a:c', 'b:c'], ['a:a', 'b:a']])

    })

})