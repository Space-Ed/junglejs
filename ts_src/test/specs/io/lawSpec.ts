import {parseLawExpression} from '../../../interoperability/law'

describe('law parsing', function(){

    fit('should parse a single simple rule', function(){
        let parsed = parseLawExpression('a:b->c:d', 'medium')
        expect(parsed[0].designatorA).toBe('a:b')
        expect(parsed[0].designatorB).toBe('c:d')
    })

    fit('should parse matching rules', function(){
        let parsed = parseLawExpression('a:symbo#{fe,fi,fo}=>captain:deranged', 'medium')
        expect(parsed[0].designatorA).toBe('a:symbo#{fe,fi,fo}')
        expect(parsed[0].designatorB).toBe('captain:deranged')
        expect(parsed[0].matching).toBe(true)
    })

    fit('should parse medium in middle',function(){
        let parsed = parseLawExpression('nz:wellington=(byair)=>aus:Melbourne')
        expect(parsed[0].designatorA).toBe('nz:wellington')
        expect(parsed[0].designatorB).toBe('aus:Melbourne')
        expect(parsed[0].medium).toBe('byair')
    })

    fit('should parse chain link rules', function(){
        let parsed = parseLawExpression('nz:wellington =(byair)=> aus:Melbourne -(byboat)-> usa:hawaii =(bytube)=> usa:sanfran')
        expect(parsed.length).toBe(3)
        
    })

})