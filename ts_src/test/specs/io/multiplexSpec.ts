import {MuxMedium} from "../../../interoperability/media/multiplexing";
import TestApp from '../../helpers/testApp'

describe("multiplex medium", function(){

    it('should transport data across the cell', function(){

        let app = new TestApp({
            form:{
                debug:true,
                media:['direct'],
                mesh:{
                    'direct':[
                        ':a#->:b#'
                    ],
                }
            },

            a:{basis:'hook:call', direction:'in', mode:'pull'},
            b:{basis:'hook:call', direction:'out', mode:'pull'}

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
        })


    })


})
