import {MuxMedium,CALLTYPE} from "../../../interoperability/media/multiplexing";
import TestApp from '../../helpers/testApp'

describe("multiplex medium", function(){

    it('should transport data across the cell', function(done){
        let app = new TestApp();

        app.init({
            form:{
                debug:true,
                media:['smear'],
                laws:{
                    'smear':[
                        ':a->:b'
                    ],
                }
            },

            a:{basis:'contact:op', carry_in:true},
            b:{basis:'contact:op', carry_out:true}

        });

        // expect(app.mesh.media.smear.muxspec.emitCallType).toBe(CALLTYPE.BREADTH_FIRST)

        app.callResponseTest({
            label:'plexresponse',
            inputContact:':a',
            outputContact:':b',
            inputValues:['one'],
            outputValues:['one'],
            returnValues:['one'],
            respondant(x){
                return x}
        }).then(done)
    })

    describe('entry and subcells situation', function(){
        let app

        beforeAll(function(){
            app= new TestApp();

            app.init({
                form:{
                    debug:true,

                    prime(){
                        // this.addMedium('compose', {
                        //     symbols:['outer', 'inner']
                        // })
                        //
                        // this.addMedium('split', {
                        //     symbols:['outer', 'inner']
                        // })
                        //
                        // this.addRule('compose', ':entry->outer#:inner#')
                        // this.addRule('split', ':split->outer#:inner#')
                    },

                    media:{
                        'compose':{
                            symbols:['outer', 'inner']
                        },'split':{
                            symbols:['outer', 'inner']
                        }
                    },
                    laws:{
                        'compose':[
                            ':entry->outer#:inner#'
                        ],
                        'split':[
                            ':split->outer#:inner#'
                        ]
                    }
                },

                a:{
                    basis:'cell',
                    receptorA:{basis:'contact:op', resolve_in(val){return "receptorA in cell a got "+val}},
                    receptorB:{basis:'contact:op', resolve_in(val){return "receptorB in cell a got "+val}}
                },

                b:{
                    basis:'cell',
                    receptorA:{basis:'contact:op', resolve_in(val){return "receptorA in cell b got "+val}},
                    receptorB:{basis:'contact:op', resolve_in(val){return "receptorB in cell b got "+val}}
                },

                entry:{basis:'contact:op', carry_in:true},
                split:{basis:'contact:op', carry_in:true}

            });
        })
        it('should perform recomposition the cell', function(done){

            app.callReturnTest({
                label:'plexresponse',
                inputContact:':entry',
                inputValues:['Value'],
                returnValues:[{
                    a:{
                        receptorA:'receptorA in cell a got Value',
                        receptorB:'receptorB in cell a got Value'
                    },
                    b:{
                        receptorA:'receptorA in cell b got Value',
                        receptorB:'receptorB in cell b got Value'
                    }
                }]
            }).then(done)

        })

        it('should perform split recomposition', function(done){

            app.callReturnTest({
                label:'plexresponse',
                inputContact:':split',
                inputValues:[{
                    a:{
                        receptorA:'Value: a.A',
                        receptorB:"Value: a.B"
                    },
                    b:{
                        receptorA:"Value: b.A",
                        receptorB:"Value: b.B"
                    }
                }],
                returnValues:[{
                    a:{
                        receptorA:'receptorA in cell a got Value: a.A',
                        receptorB:'receptorB in cell a got Value: a.B'
                    },
                    b:{
                        receptorA:'receptorA in cell b got Value: b.A',
                        receptorB:'receptorB in cell b got Value: b.B'
                    }
                }]
            }).then(done)

        })
    })

})
