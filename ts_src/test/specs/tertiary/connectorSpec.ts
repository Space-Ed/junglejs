import TestApp from '../../helpers/testApp'
import * as Debug from '../../../util/debug'

import {j} from '../../../jungle'

import Jasmine = require('jasmine')

describe('rule connector constructs', function(){

    it('should create link when part of spec', function(){

        let app = new TestApp()

        app.init({
            form:{
                debug:true
            },
            direct:j('media:direct'),
            haunts:j('law',':ghost-(direct)->:child'),

            ghost:{
                basis:'contact:into'
            },
            child:{basis:'contact:outof'}
        });


        app.shell.contacts.child.emit = (data, crumb)=>{
            crumb.drop('Finally Child emit')
            return data
        }

        app.call(':ghost', "probe4").then(probed=>{
            // console.log('probed: \n',Debug.dumpToDepthF(3)(probed))
            // expect(probed).toBe(app.lining.contacts.child, 'probing the ghost')
        })

        // console.log('present: \n',Debug.dumpToDepthF(3)(app.shell.contacts.ghost))


        expect(app.shell.contacts.ghost.partner).toBe(app.lining.contacts.ghost, 'properly inverted')

        expect(app.lining.contacts.ghost.hasOutput).toBe(true,'ghost has output on lining')
        expect(app.lining.contacts.child.hasInput).toBe(true,'ghost has input on lining')

        expect(app.mesh.hasLinked(':ghost', ':child')).toBe(true,'link formed')
        expect(app.lining.contacts.ghost.emit).toBeDefined()
        expect(app.shell.contacts.ghost.partner.emit).toBeDefined()
        // (app.lining.contacts.child.put, 'direct link created')
        //
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
