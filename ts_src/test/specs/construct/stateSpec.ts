
import {Construct, Composite, Domain} from '../../../construction/all'

import {AccessoryState, HostState} from '../../../construction/state'
import {j} from '../../../jungle'

describe('state model', function (){

    describe('integrated', function(){

        let domain = new Domain({
            host:Composite,
            accessory:Construct
        })

        it('a composite is a host and a component is an accessory', function(){
            let composite = <Composite>domain.recover(j('host',{
                publicacc:j('accessory',{
                    head: {
                        exposure:'public',
                        reach:'host'
                    }
                }),
                publichost:j('host',{
                    head:{
                        exposure:'public'
                    }
                })
            }))

            expect(composite.subconstructs.publicacc.exposure).toBe('public')
            let accval = composite.subconstructs.publicacc.nucleus

            expect(accval).toBe(composite.local['publicacc'])
            expect(composite.subconstructs['publichost'].exposed).toBe(composite.exposed['publichost'])

        })

        it('a composite has access to a local accessory and host ',function(){
            let composite = <Composite>domain.recover(j('host',{
                localacc:j('accessory',{
                    head:{
                        exposure:'local',
                        reach:'host'
                    }
                }),
                localhost:j('host',{
                    head:{
                        exposure:'local'
                    }
                })
            }))

            expect(composite.local.localacc).toBe(composite.subconstructs.localacc.exposed.me)
            expect(composite.local.localhost).toBe(composite.subconstructs.localhost.exposed)
        })

        it('a composite cannot access private accessory and host ',function(){
            let composite = domain.recover(j('host',{
                localacc:{
                    basis:'accessory',
                    head:{
                        exposure:'private',
                        reach:'host'
                    }
                },
                localhost:{
                    basis:'host',
                    head:{
                        exposure:'private'
                    }
                }
            }))

            expect(composite.local.localacc).toBeUndefined()
            expect(composite.local.localhost).toBeUndefined()
        })

        it('as an accessory changes its nucleus the reference through me is updated', function(){

            let composite = <Composite>domain.recover(j('host',{
                localacc:{
                    value:'thing',
                    basis:'accessory',
                    head:{
                        exposure:'local',
                        reach:'host'
                    }
                }
            }))

            expect(composite.local.localacc.value).toBe(composite.subconstructs.localacc.local.me.value)

            composite.patch({
                localacc:{value:'thang'}
            })

            expect(composite.subconstructs.localacc.local.me.value).toBe('thang')


        })


    })

    

})
