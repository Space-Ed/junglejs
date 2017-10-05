
import TestApp from  '../../helpers/testApp'
import {J, j, Cell} from '../../../jungle'

describe('meta access agent', function(){
    let app, notifySpy
    beforeEach(function(){

        app = new TestApp(J)

        notifySpy = jasmine.createSpy('inner notify')

        app.init({
            meta:{
                basis:'agent:context'
            },

            head:{
                begin(){
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

        expect(app.subconstructs.meta.exposure).toBe('local')
        expect(app.subconstructs.meta.agency).toBe(app.pool.pool.meta, "Is meta in the host pool")
        expect(app.subconstructs.meta.nucleus).toBe(app.local.meta, "Is nucleus the exposed")

        app.call(':anop', null).then(result => {
            expect(result).toBe(app.subconstructs.meta.nucleus)
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

        //resolve historian applies the patch
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


describe('contact agent', function(){

    it('two cells with identical construction should stay synchronized when paired over a medium', function(){

        J.extend('cell', 'sync', {
            sync:j('agent:contact', {
                head:{
                    presence:'shell'
                }
            })
        })

        const prepatch = j('cell', {
            head:{
                media:['direct'],
                laws:{
                    direct:[ 'a:sync<->b:sync']
                }
            },

            a:j('sync'),
            b:j('sync')
            //synclink:j('link', {rule: 'a:sync<->b:sync', medium:'direct'})
        })

        let root:Cell = J.recover(prepatch)

        expect(root.lining.subranes.a.contacts.sync).toBeDefined()

        root.extract(null).then(ext=>{
            console.log(ext)
            expect(ext).toEqual(j('sync'))
        })

        expect(root.mesh.hasLinked('a:sync', 'b:sync')).toBe(true, 'Has linked')
        root.patch({a:{bombastic:'patched'}})

        root.extract({b:{bombastic:null}}).then(ext=>{
            expect(ext).toBe('patched')
        })

        root.patch({b:{flabberghast:'modified'}})

        root.extract({a:{flabberghast:null}}).then(ext=>{
            expect(ext).toBe('modified')
        })
    })
})


describe('operatorbrane', function(){

    it('can have pull and push to go upstream and downstream to waiting ',function(done){

        let org = J.recover(j('cell', {
            head:{
                media:['direct'],
                laws:{
                    'direct':[
                        'churner.meta:pull->upstream:mine',
                        'churner.meta:push->downstream:dump'
                    ]
                }
            },


            upstream:j('cell', {
                meta:j('agent:context',{}),

                mine:j('contact:op',{
                    resolve_in(extract){
                        console.log('fetched from mine', extract)
                        return this.meta.extract()
                    }
                })
            }),


            churner:j('cell', {
                head:{
                    forward:':churn'
                },

                metx:j('agent:context'),
                churn:j('contact:op', {
                    resolve_in(){
                        //cause fetch then extract
                        this.metx.extract({mine:null}).then(ext=>{
                            this.metx.patch(ext)
                        })
                    }
                }),

                meta:j('agent:membrane',{
                    head:{
                        presence:'shell',
                    },
                }),
            }),

            downstream:j('cell', {
                dump:j('contact:op',{
                    resolve_in(extract){
                        this.meta.extract()
                    }
                })
            })
        }))

        org.patch({upstream:{upspaced:'swank'}})

        org.extract({downstream:{upspaced:null}}).then(ext=>{
            expect(ext).toBe(undefined)
        })

        //trigger movement
        org.seek('churner:churn').put()

        org.extract({downstream:{upspaced:null}}).then(ext=>{
            expect(ext).toBe('swank')
            done()
        })
    })
})
