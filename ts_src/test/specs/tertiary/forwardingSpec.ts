import {run} from '../../jungle-test/run'
import {TestCell} from '../../jungle-test/domain'
import {j, J} from '../../../jungle'

let SubDomain

//the situations are achieved by creating a detector and emmitter 


fdescribe('forwarding', function(){
    beforeAll(function(){
        SubDomain = J.sub('forwards', {rebasing:false})

            .define('sitch', j('test:cell', {
                head:{
                    tid:'root'
                },
                
                cell: j('cell', {
                    
                    deep: j('cell', {
                        l2:j('test:emitter', {
                            tid: 'l2',
                            outward: true,
                            inward: false
                        })
                    }),
                    
                    l1:j('test:emitter', {
                        tid:'l1',
                        outward:true,
                        inward:false
                    })
                    
                }),

                comm: j('media:direct', {
                    law: '**:*->:detect'
                }),
                
                detect: j('test:detector', {
                    tid: 'd1',
                    inner: true
                }),
                
            }))
    })
    

    it('should by default forward', function(done){
        run({
            domain:SubDomain,
            situation:j('sitch'),
            moments:'1',
            schedule:[
                {at:'1', tid:'l2', type:'emit', value:'GO'},
                {at:'1', tid:'root', type:'interject', func(ev, targ){
                    expect(targ instanceof TestCell).toBe(true, 'Is test cell at root')
                    return targ.shellContacts
                }},
            ],
            expected:[
                {at:'1', tid:'d1', expect:'nothing'},
                {at:'1', tid:'root', expect:'equality', value: ['cell:l1','cell.deep:l2', ':detect']}    
            ],
            done:done,
        })
    })

    it('if either retain or withold is true it will retain which will allow it to bridge the root context', function(done){
        run({
            domain:SubDomain,
            situation:[
                
            j('sitch',{
                head:{
                    retain:true
                }
            }), 

            j('sitch', {
                cell:j('cell', {
                    head: {
                        withold: true
                    }
                })
            })],
            moments: '1-2',
            schedule: [
                { at: '1', tid: 'l2', type: 'emit', value: 'GO' },
                { at: '2', tid: 'l1', type: 'emit', value: 'POW' },
            ],
            expected: [
                { at: '1', tid: 'd1', expect: 'equality' , value:'GO' },
                { at: '2', tid: 'd1', expect: 'equality' , value:'POW' }
            ],
            done: done,
        })
    })

    it('selective retain and withold', function(done){

        //our deep cell will withold and selectively release its contact

        run({
            domain: SubDomain,
            situation:[
                j('sitch',{
                    head:{
                        retain:true,
                    },
    
                    cell:j('cell', {
                        head:{
                            tid:'cell'
                        },
                        
                        deep:j('cell',{
                            head:{
                                withold: ':l2',
                            }
                        })
                    })
                }),

            ],

            moments: '1-2',
            schedule: [
                { at: '1', tid: 'root', type: 'inspect', prop:'links'},
                { at: '2', tid: 'root', type: 'inspect', prop:'liningContacts'},
            ],
            expected: [
                { at: '1', tid: 'root', expect:'exists', type:'inspect', value: {connect:[[
                    'cell:l1', ':detect']]}, interest:true},

                { at: '2', tid: 'root', expect:'exists', type:'inspect', value: ['cell:l1', ':detect'], interest:true},
            ],
            done:done
        })

    })

    it('selective forward and release')

})