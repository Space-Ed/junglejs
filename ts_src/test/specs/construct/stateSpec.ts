
import {Construct, Composite, Domain} from '../../../construction/all'

import {AccessoryState, HostState} from '../../../construction/state'

describe('state model', function (){

    describe('proxies',function(){
        let privateAccessory, publicAccessory, localAccessory
        let hostInternal
        let localHost

        beforeEach(function(){
            privateAccessory = new AccessoryState('private', 'mrthing', {})
            hostInternal = {}
            localHost = new HostState('local', hostInternal)
            localHost.addSub('mrthing', privateAccessory)
            localAccessory = localHost.createAccessory('self','local','sgtstuff', 'attention!')
            publicAccessory = localHost.createAccessory('host','public','majorjamble', 'strike!')
        })

        it('should not be able to get at the private from the local or external scopes', function (){
            privateAccessory.exposed.me = 'hello'
            expect(localHost.local['mrthing']).toBeUndefined()
            expect(localHost.exposed['mrthing']).toBeUndefined()
            expect(privateAccessory.exposed.mrthing).toBe('hello')
        })

        it('should not be able to get at the local from the extenal host scope', function(){
            expect(localHost.local.sgtstuff).toBe('attention!')
            expect(localHost.exposed.sgtstuff).toBeUndefined()
        })

        it('with a host purview an accessory can get from a local other', function(){
            expect(localHost.exposed.majorjamble).toBe('strike!')
            expect(publicAccessory.exposed.sgtstuff).toBe('attention!')
            expect(localAccessory.exposed.majorjamble).toBeUndefined()
        })

    })

    describe('integrated', function(){

        let domain = new Domain({
            host:Composite,
            accessory:Construct
        })

        it('a composite is a host and a component is an accessory', function(){
            let composite = domain.recover({
                basis:'host',
                publicacc:{
                    basis:'accessory',
                    form: {
                        exposure:'public',
                        reach:'host'
                    }
                },
                publichost:{
                    basis:'host',
                    form:{
                        exposure:'public'
                    }
                }
            })

            expect(composite.subconstructs['publicacc'].exposed.me).toBe(composite.local['publicacc'])
            expect(composite.subconstructs['publichost'].exposed).toBe(composite.exposed['publichost'])

        })

        it('a composite has access to a local accessory and host ',function(){
            let composite = domain.recover({
                basis:'host',
                localacc:{
                    basis:'accessory',
                    form:{
                        exposure:'local',
                        reach:'host'
                    }
                },
                localhost:{
                    basis:'host',
                    form:{
                        exposure:'local'
                    }
                }
            })

            expect(composite.local.localacc).toBe(composite.subconstructs.localacc.exposed.me)
            expect(composite.local.localhost).toBe(composite.subconstructs.localhost.exposed)
        })

        it('a composite cannot access private accessory and host ',function(){
            let composite = domain.recover({
                basis:'host',
                localacc:{
                    basis:'accessory',
                    form:{
                        exposure:'private',
                        reach:'host'
                    }
                },
                localhost:{
                    basis:'host',
                    form:{
                        exposure:'private'
                    }
                }
            })

            expect(composite.local.localacc).toBeUndefined()
            expect(composite.local.localhost).toBeUndefined()
        })

        it('as an accessory changes its nucleus the reference through me is updated', function(){

            let composite = domain.recover({
                basis:'host',
                localacc:{
                    value:'thing',
                    basis:'accessory',
                    form:{
                        exposure:'local',
                        reach:'host'
                    }
                }
            })

            expect(composite.local.localacc.value).toBe(composite.subconstructs.localacc.local.me.value)

            composite.patch({
                localacc:{value:'thang'}
            })

            expect(composite.subconstructs.localacc.local.me.value).toBe('thang')


        })


    })

})
