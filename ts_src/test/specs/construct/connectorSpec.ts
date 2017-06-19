import {Connect, TunnelIn, TunnelOut} from '../../../aliases/all'
import TestApp from '../../helpers/testApp'

import Jasmine = require('jasmine')

describe('rule connector constructs', function(){

    it('should create link when part of spec', function(){

        let app = new TestApp({
            form:{
                mesh:{
                    'direct':[]
                }
            },

            ghost:TunnelIn(),
            haunts:Connect(':ghost->:child','direct'),
            child:TunnelOut()
        })

        app.prime();

        app.callResponseTest({
            inputContact:':ghost',
            outputContact:':child',

            inputValues:['boo'],
            outputValues:['boo'],
            returnValues:[undefined],

            respondant:(data, crumb)=>{
                return undefined
            }
        })

        app.remove('haunts');

        app.callResponseTest({
            inputContact:':ghost',
            outputContact:':child',

            inputValues:['boo'],
            outputValues:[Symbol.for('NOCALL')],
            returnValues:[undefined],

            respondant:(data, crumb)=>{
                return undefined
            }
        })
    })

})
