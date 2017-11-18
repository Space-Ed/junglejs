import * as D from '../../../util/designation/all'
import {parseDesignatorString as parse, tokenize} from '../../../util/designation/all'
import {deeplyEqualsThrow} from '../../../util/checks'

describe('',function(){
    const scan = D.scannerF('departments', 'employees')
    const structure = {
        departments:{
            production:{
                departments:{
                    production:{
                        employees:{
                            dao:"Meta Computer"
                        }
                    }
                },
                employees:{
                    dao:"World Computer"
                }
            },
            china:{
                departments:{
                    sales:{
                        employees:{
                            jono:"flipper J"
                        }
                    },
                    production:{
                        employees:{
                            fred:"nuts and bolts",
                            ed:"soldering"
                        }
                    }
                },employees:{
                    AreaManager:"Foreign arm",

                }
            },
            usa:{
                departments:{
                    sales:{
                        employees:{
                            rex:"R dog"
                        }
                    },
                    engineering:{
                        employees:{
                            geoff:"invents everything"
                        }
                    }
                },employees:{
                    AreaManager:"DomesticArm"
                }
            }
        },
        employees:{
            CEO:"Big Boss",
            CFO:"Profiteer",
            CTO:"Technocrat"
        }
    }

    function testScanF(structure){
        return (desigstr, expected, debug=false)=>{
            let scanned = scan(parse(desigstr), structure)
            if(debug) console.log('scanned: ', scanned);
            let tokenized = tokenize(scanned)
            if(debug) console.log('tokenized: ', tokenized)
            expect(tokenized).toEqual(expected)
        }
    }

    const testScanStructure = testScanF(structure)

    beforeEach(function(){

    })

    it('should designate at a basic level', function(){
        testScanStructure(':CEO', {
            ':CEO': "Big Boss"
        })
    })

    it('should designate at a deep level', function(){
        testScanStructure("usa.engineering:geoff",{
            'usa.engineering:geoff':'invents everything'
        })
    })

    it('should designate all', function(){
        testScanStructure('**:*',{
            ':CEO': 'Big Boss',
            ':CFO': 'Profiteer',
            ':CTO': 'Technocrat',
            'production:dao': 'World Computer',
            'production.production:dao':'Meta Computer',
            'china:AreaManager': 'Foreign arm',
            'china.sales:jono': 'flipper J',
            'china.production:fred': 'nuts and bolts',
            'china.production:ed': 'soldering',
            'usa:AreaManager': 'DomesticArm',
            'usa.sales:rex': 'R dog',
            'usa.engineering:geoff': 'invents everything'
        })
    })

    it('should designate terminal match', function(){
        testScanStructure("**:AreaManager",{
            'china:AreaManager': 'Foreign arm',
            'usa:AreaManager': 'DomesticArm'
        })
    })

    it('should designate end path', function(){
        testScanStructure("**.sales:*",{
            'china.sales:jono': 'flipper J',
            'usa.sales:rex':'R dog'
        })
    })

    it('should designate these guys',function(){
        let toy = {
            groups:{
                a:{
                    groups:{
                        a:{
                            terms:{
                                A:'a.a:A'
                            }
                        }
                    },
                    terms:{
                        A:undefined
                    }
                },
                b:{
                    groups:{
                        a:{
                            terms:{
                                A:'b.a:A'
                            }
                        }
                    }
                }
            },
            terms:{
                A:'A',
                B:'B',
            }
        }

        let scan = D.scannerF('groups', 'terms')

        //injecting circularity
        // let terb = {turbine:undefined}
        // terb.turbine = terb;
        // toy.groups.a.terms.A  = terb

        let desig = tokenize(scan(parse('**.a:*'), toy))

        expect(desig).toEqual({
            'a.a:A':'a.a:A',
            'b.a:A':'b.a:A',
            'a:A':undefined
        })

    })

    it('should designate at many depths', function(){

        testScanStructure("**.production:*", {
            'production:dao': 'World Computer',
            'production.production:dao': 'Meta Computer',
            'china.production:ed': 'soldering',
            'china.production:fred': 'nuts and bolts'
        })
    })
   
})

describe('matching', function(){

    it('should match tokens that would be selected by the designator', function(){

        let desigPlusMinus = [
            ['*.b:*', ['a.b:c', 'all_the_thing.b:blab$'], ['a.d:c', 'd.d:c', 'b:c']],
            ['**:C', ['a.b:C', 'b:C', ':C'], ['a.d:c']]
        ]

        for (let [d, plus, minus] of desigPlusMinus){
            let desig = parse(<string>d)
            for (let token of plus){
                expect(D.matches(desig, D.parseTokenSimple(token))).toBeTruthy(`designator ${d} should match token ${token}`)
            }
            
            for (let token of minus) {
                expect(D.matches(desig, D.parseTokenSimple(token))).toBeFalsy(`designator ${d} should NOT match token ${token}`)
            }
        }
        
    })
})