import {MuxMedium} from "../../../interoperability/media/multiplexing";
import TestApp from '../../helpers/testApp'

describe("multiplex medium", function(){

    it('should transport data across the cell', function(done){
        let app = new TestApp({
            form:{
                debug:true,
                media:['direct'],
                mesh:{
                    'direct':[
                        ':a->:b'
                    ],
                }
            },

            a:{basis:'hook:call', direction:'in', type:'hook', inject:false},
            b:{basis:'hook:call', direction:'out', type:'hook', inject:false}
        });

        app.prime();

        app.callResponseTest({
            label:'plexresponse',
            inputContact:':a',
            outputContact:':b',
            inputValues:['one'],
            outputValues:['one'],
            returnValues:['one'],
            respondant(x){return x}
        }).then(done)
    })

    describe('entry and subcells situation', function(){
        let app = new TestApp({
            form:{
                debug:true,
                media:{
                    'compose':{
                        symbols:['outer', 'inner']
                    },'split':{
                        symbols:['outer', 'inner']
                    }
                },
                mesh:{
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
                receptorA:{basis:'hook:call', direction:'in', type:'hook', inject:true, hook(val){return "receptorA in cell a got "+val}},
                receptorB:{basis:'hook:call', direction:'in', type:'hook', inject:true, hook(val){return "receptorB in cell a got "+val}}
            },

            b:{
                basis:'cell',
                receptorA:{basis:'hook:call', direction:'in', type:'hook', inject:true, hook(val){return "receptorA in cell b got "+val}},
                receptorB:{basis:'hook:call', direction:'in', type:'hook', inject:true, hook(val){return "receptorB in cell b got "+val}}
            },

            entry:{basis:'hook:call', direction:'in', type:'hook', inject:false},
            split:{basis:'hook:call', direction:'in', type:'hook', inject:false},

        });

        app.prime();

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
