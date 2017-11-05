import TestApp from '../../helpers/testApp'
import * as Debug from '../../../util/debug'

import {j, J} from '../../../jungle'

describe('rule connector constructs', function(){

    it('should create link when part of spec', function(){

        let app:any = new TestApp(J)

        app.init(j({

            head:{
                debug:true
            },

            direct:j('media:direct'),
            haunts:j('law',':ghost-(direct)->:child'),

            ghost:j('inward'),
            child:j('outward'),

        }));


        app.shell.contacts.child.emit = (data, crumb)=>{
            crumb.drop('Finally Child emit')
            return data
        }

        expect(app.shell.contacts.ghost.partner).toBe(app.lining.contacts.ghost, 'properly inverted')

        expect(app.lining.contacts.ghost.hasOutput).toBe(true,'ghost has output on lining')
        expect(app.lining.contacts.child.hasInput).toBe(true,'ghost has input on lining')

        // expect(app.weave.hasLinked(':ghost', ':child')).toBe(true,'link heeded')

        expect(app.lining.contacts.ghost.emit).toBeDefined('emit has been assigned on ghost')
        
        // expect(app.shell.contacts.ghost.partner.emit).toBeDefined('')
        
        
        app.callResponseTest({
            label:'test scare throughput',
            inputContact:':ghost',
            outputContact:':child',

            inputValues:['boo'],
            outputValues:['boo'],
            returnValues:[undefined],

            respondant:(data, crumb)=>{
                return undefined
            }
        })
        //
        app.remove('haunts');

        app.callResponseTest({
            label:'test no scare',
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
