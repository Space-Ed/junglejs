
import TestApp from  '../../helpers/testApp'
import {J, j, Cell} from '../../../jungle'

describe('heart access agent', function(){
    let app, notifySpy
    beforeEach(function(){

        app = new TestApp(J)

        notifySpy = jasmine.createSpy('inner notify')

        app.init(j({

            head:{
                
                heart:{
                    present:{
                        patch:true,
                        notify:true,
                        fetch:true,
                        extract:true,
                        priority:3
                    },
                    exposed: {
                        patch: true,
                        notify: true,
                        fetch: true,
                        extract: true,
                        priority:4

                    },
                    other: {
                        patch: true,
                        notify: true,
                        fetch: true,
                        extract: true,
                        priority: 10
                    }
                },

                pool:{
                    pullStrategy:'first-defined',
                    pushStrategy:'check-all'
                },

            },

            anop:j('op',{
                resolve_in(data){
                    return this.heart
                }
            })
        }))

        app.local.heart.notify = notifySpy //the heart is present after head
 
    })

    it('is appearing in the context and pool', function(){

        expect(app.nucleus.heart).toBe(app.local.heart, "Is nucleus the exposed")

        expect(app.shell.contacts.anop.put).toBeDefined()

        app.call(':anop', null).then(result => {
            expect(result).toBe(app.nucleus.heart)
        })

    })

    it('the host is being notified when the agent patches and vice versa', function(){

        app.notify = jasmine.createSpy('outer notify spy')

        let selfpatching = {
            historian:j('op',{
                resolve_in(data){
                    this.heart.patch(data)
                }
            })
        }

        app.patch(selfpatching)

        expect(notifySpy).toHaveBeenCalledWith(selfpatching)
        //expect(notifySpy.calls.first().args[0]).toEqual(selfpatching)


        //resolve historian applies the patch
        app.call(':historian', {gradStudent:"fantastic"})

        expect(app.notify.calls.first().args[0]).toEqual({
            gradStudent:'fantastic'
        })

        app.extract().then(extracted=>{
            expect(extracted).toEqual({
                historian:{
                    basis:'contact:op',
                    body:{
                        resolve_in: selfpatching.historian.body.resolve_in
                    }
                },
                gradStudent:'fantastic'
            })
        })


    })

})
