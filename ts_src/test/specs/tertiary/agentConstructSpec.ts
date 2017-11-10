
import TestApp from  '../../helpers/testApp'
import {J, j, Cell} from '../../../jungle'

J.define('test', TestApp)

let app, agentNotifySpy, outerNotifySpy, heartNotifySpy

agentNotifySpy = jasmine.createSpy('agent notify')
heartNotifySpy = jasmine.createSpy('heart notify')
outerNotifySpy = jasmine.createSpy('outer notify')
J.define('scenari', j('test', {
    head: {
        prime() {
            
            this.heart.notify = heartNotifySpy;
        },

        heart: {
            present: {
                patch: true,
                notify: true,
                fetch: true,
                extract: true,
                priority: 3
            },
            exposed: {
                patch: true,
                notify: true,
                fetch: true,
                extract: true,
                priority: 4

            },
            other: {
                patch: true,
                notify: true,
                fetch: true,
                extract: true,
                priority: 10
            }
        },

        pool: {
            pullStrategy: 'first-defined',
            pushStrategy: 'check-all'
        },

    },

    anop: j('resolve', {
        head: {
            attach() {
                this.agent.notify = agentNotifySpy;
            }
        },

        outer(data) {
            //dig into the core and rip the heart out
            return { mine: this.heart, agent: this.world.heart }
        }
    })
}))

describe('heart access agent', function(){
    beforeAll(function(){
        
    })

    beforeEach(function(){

        agentNotifySpy.calls.reset()
        heartNotifySpy.calls.reset()
        outerNotifySpy.calls.reset()

        app =  J.recover('scenari')
        app.notify = outerNotifySpy
 
    })

    it('is appearing in the context and pool', function(){

       
        //expect(app.subconstructs.anop.heart.notify).toBe(agentNotifySpy, "notify applied to agent")

        expect(app.self.heart).toBe(app.heart, "the heart is part of the self")

        expect(app.shell.contacts.anop.put).toBeDefined()

        app.call(':anop', null).then(({mine:mine, agent}) => {
            expect(mine).toBe(app.subconstructs.anop.heart)
            expect(agent.notify).toBe(agentNotifySpy)
            expect(app.heart.notify).toBe(heartNotifySpy, "the notify is applied to the heart")

        })

    })

    it(' acting upon the agency can cause change in the host', function(){
        //can it self modify 
    })

    it('the host is being notified when the agent patches and vice versa', function(){

        let selfpatching = {
            historian:j('resolve',{
                outer(data){
                    this.agent.patch(data) 
                }
            })
        }

        app.patch(selfpatching)

        expect(agentNotifySpy).toHaveBeenCalledWith(selfpatching)
        expect(heartNotifySpy).toHaveBeenCalledWith(selfpatching)
        expect(outerNotifySpy).not.toHaveBeenCalled()
        //expect(agentNotifySpy.calls.first().args[0]).toEqual(selfpatching)


        //resolve historian applies the patch
        app.call(':historian', {gradStudent:"fantastic"})

        expect(app.notify.calls.first().args[0]).toEqual({
            gradStudent:'fantastic'
        })

        let extracted = app.extract({
            historian:null,
            gradStudent:null
        })

        let described:any = J.describe(app, 'scenari')

        expect(extracted).toEqual({
            historian:{
                inner:false,
                either:false,
                outer: selfpatching.historian.body.outer
            },
            gradStudent:'fantastic'
        })
    })

})
