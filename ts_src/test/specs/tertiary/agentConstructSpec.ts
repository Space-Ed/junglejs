
import TestApp from  '../../helpers/testApp'
import {Core} from '../../../jungle'

describe('meta access agent', function(){
    let app, notifySpy
    beforeEach(function(){

        app = new TestApp(Core)

        notifySpy = jasmine.createSpy('inner notify')

        app.init({

            form:{
                prime(){
                    this.meta.notify = notifySpy
                }
            },

            anop:{
                basis:'contact:op',
                resolve_in(data){
                    console.log('at resolve meta', this.meta)
                    return this.meta
                }
            }
        })
    })

    it('is appearing in the context and pool', function(){

        expect(app.meta.exposure).toBe('local')
        expect(app.meta.agency).toBe(app.pool.pool.meta, "Is meta in the host pool")
        expect(app.meta.nucleus).toBe(app.local.meta, "Is nucleus the exposed")

        app.call(':anop', null).then(result => {
            expect(result).toBe(app.meta.nucleus)
        })

    })

    it('the host is being notified when the agent patches and vice versa', function(){

        app.notify = jasmine.createSpy('outer notify spy')

        let selfpatching = {
            historian:{
                basis:'contact:op',
                resolve_in(data){
                    this.meta.patch(data)
                }
            }
        }

        app.patch(selfpatching)

        expect(notifySpy.calls.first().args[0]).toEqual(selfpatching)

        app.call(':historian', {gradStudent:"fantastic"})

        expect(app.notify.calls.first().args[0]).toEqual({
            gradStudent:'fantastic'
        })

        app.extract().then(extracted=>{

            expect(extracted).toEqual({
                historian:{
                    basis:'contact:op',
                    resolve_in:selfpatching.historian.resolve_in
                },
                gradStudent:'fantastic'
            })
        })


    })

})
