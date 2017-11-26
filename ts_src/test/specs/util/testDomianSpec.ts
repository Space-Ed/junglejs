import {j, Domain, J} from '../../../jungle'
import { DetectorContact, EmitterContact} from '../../jungle-test/domain'
import {run } from '../../jungle-test/run'

describe('testing', function(){
    let subject:Domain

    beforeAll(function(){
        J.define('scenario', j('cell', {
            connect: j('media:direct'),
            law: j('law', ':emitter-(connect)->:detector'),

            emitter: j('test:emitter', {
                tid: 'e1',
                inward: true
            }),

            detector: j('test:detector', {
                tid: 'd1',
                inner: true,
                outer: true,
                mock: 'Mock Response'
            }),
        }))
    })

    beforeEach(function(){
        subject = new Domain();
        

    })

    describe('emitter', function(){

        it('should throw back an error when it is not connected to anything', function (done){
            pending('behaviour of unconnected contacts may be variable')

            run({
                domain:J,
                situation:j('cell', {
                    e1: j('test:emitter', {
                        tid:'e1'
                    })
                }),
                dashTime: 10,
                done :done,
                moments:'1+2',
                schedule:[{
                    at:'1',
                    tid:'e1',
                    type:'emit',
                    value:'bang'
                }
            ],
                expected:[{
                    at:'1',
                    interest:true,
                    expect:'exists',
                    type:'err',
                    tid:'e1',
    
                }]
            })
        })

    })

    describe('detector', function(){

        it('should detect across the cell', function(done){
            run({
                domain: J,
                situation: j('scenario'),
                moments: '1+2', dashTime:20,

                schedule: [
                    { at: '1', tid: 'e1', type:'emit', value: 'something' }
                ],

                expected: [
                    //{at: '1', tid: 'e1', type:'err', interest:true, expect:'exists'},
                    { at: '1', tid: 'd1', type:'put', expect: 'identity', value: 'something' },
                    { at: '1', tid: 'e1', type:'resp', expect: 'equality', value: 'Mock Response' },
                ],

                done: done

            })
        })
    })

    describe('forstalled moments', function(){
        it('should respond in the moment after with mock returning timeout junction', function(){

            // run({
            //     domain: J,
            //     situation:j('scenario', {
            //         l2:j('law',':emitter-(cast)->delay'),

            //     })
            // })

        })
    })

})
// run({
//     domain: J,
//     situation: j('cell', {
//         emitterA: j('test:emitter', {
//             in: true,
//             tid: 'emmitterA'
//         }),

//         bury: j('cell', {
//             admit: j('op', {
//                 carry_in: true,
//             }),

//             direct: j('media:direct', {
//                 law: ':admit->:detectA'
//             }),

//             detectA: j('test:detector', {
//                 out: true
//             }),
//         }),

//         direct: j('media:direct', {
//             law: [
//                 ':emitterA->bury:admit', 'bury:detectA'
//             ]
//         }),

//     }),

//     moments: '1|2|3---4',
//     dashTime: 10,

//     schedule: [{
//         at: 1,
//         type: 'emit',
//         tid: 'g1',
//         value: 'hello'
//     }],

//     expected: [{
//         at: 1,
//         tolerance: 0.1,
//         type: '',
//         tid: 'detector1',
//         value: 'hello'
//     }, {
//         at: 2,
//     }],

//     done: () => { }
// }))

// 
