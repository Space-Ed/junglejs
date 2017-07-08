
import * as Designate from '../../util/designator'
import {Designator} from '../../util/designator'
import {deeplyEqualsThrow} from '../../util/checks'
import {B} from '../../util/blender'

import jasmine = require('jasmine')


describe('',function(){

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

    beforeEach(function(){

    })

    it('should designate at a basic level', function(){

        let designator = new Designator('departments', 'employees', ":CEO")

        deeplyEqualsThrow(designator.scan(structure),{
            ':CEO':"Big Boss"
        })
    })

    it('should designate at a deep level', function(){
        let designator = new Designator('departments', 'employees', "usa.engineering:geoff")

        deeplyEqualsThrow(designator.scan(structure),{
            'usa.engineering:geoff':'invents everything'
        })
    })

    it('should designate all', function(){

        let designator = new Designator('departments', 'employees', "**:*")

        deeplyEqualsThrow(designator.scan(structure),{
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

        let designator = new Designator('departments', 'employees', "**:AreaManager")

        deeplyEqualsThrow(designator.scan(structure),{
            'china:AreaManager': 'Foreign arm',
            'usa:AreaManager': 'DomesticArm'
        })
    })

    it('should designate end path', function(){
        let designator = new Designator('departments', 'employees', "**.sales:*")

        deeplyEqualsThrow(designator.scan(structure),{
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

        let terb = {turbine:undefined}
        terb.turbine = terb;
        toy.groups.a.terms.A  = terb

        let desig = new Designator('groups', 'terms','**.a:*')

    })

    it('should designate at many depths', function(){

        let designator = new Designator('departments', 'employees', "**.production:*")

        deeplyEqualsThrow(designator.scan(structure),{
            'production:dao': 'World Computer',
            'production.production:dao': 'Meta Computer',
            'china.production:ed': 'soldering',
            'china.production:fred': 'nuts and bolts'
        })
    })

    it('shoule converr designator to token regex', function(){
        let basic = new Designator('g','t','a:p').regex;
        expect('a:p'.match(basic)).not.toBeNull();

        let onewild = new Designator('g','t','*:p').regex;
        expect('a:p'.match(onewild)).not.toBeNull();

        let leadingGlob = new Designator('g','t','**.a:*').regex;
        expect('globby.glob.blob.a:farts'.match(leadingGlob)).not.toBeNull();

        let multiGlob = new Designator('g','t','**.a.**:p').regex;
        expect('globby.a.globby:p'.match(multiGlob)).not.toBeNull();

        let trickyGlob = new Designator('g','t','**.a.**:p').regex;
       //console.log('trickyGlob:', trickyGlob);
        expect('globby.a.a.a:p'.match(trickyGlob)).not.toBeNull();

    })

    it('can screen other designators ',function(){

        let all = new Designator('departments', 'employees', "**:*")

        all.screen('china.**:*')

       //console.log(all.scan(structure))

        deeplyEqualsThrow(all.scan(structure),{
            ':CEO': 'Big Boss',
            ':CFO': 'Profiteer',
            ':CTO': 'Technocrat',
            'production:dao': 'World Computer',
            'production.production:dao':'Meta Computer',
            'usa:AreaManager': 'DomesticArm',
            'usa.sales:rex': 'R dog',
            'usa.engineering:geoff': 'invents everything'
        })
    })

    it('defaults a single word to be a terminal designator', function(){
        let one = new Designator('departments', 'employees', "CEO")

        expect(one.scan(structure)[':CEO']).toBe('Big Boss')

    })

})

describe('symbolic matching', function(){

    it('should designate a range', function(){

        let structure = {
            terminals:{
                0:'a'
            },
            groups:[
                {
                    terminals:"that"
                }
            ]
        }

    })


})
