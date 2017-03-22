

const Jungle = require('../../dist/jungle.js');
const Util = Jungle.Util;
const B = Util.B;

describe('deep equality', function(){

    function deepEqualTest(a, b){
        expect(Util.deeplyEquals(a,b)).toBe(false)
        expect(function(){
            Util.deeplyEqualsThrow(a,b)
        }).toThrowError();
    }

    it('should throw for basic difference',function(){
        deepEqualTest("a","b");
    })

    it('should throw for deep difference', function(){
        deepEqualTest({a:0},{a:1})
    })

    it('should throw for deep string difference', function(){
        deepEqualTest({a:{b:"one"}},{ a:{b:'two'}});
    })

    it('should throw for deep type difference',function(){
        deepEqualTest({
            node:{
                a:{
                    node:{},
                    form:{f:x=>{return x}, c:'identity', m:''},
                    state:{}
                }
            },
            form:{f:'fame', c:'identity', m:''},
            state:{fearless:0}
        },
        {
            node:{
                a:{
                    node:{},
                    form:{f:'identity', c:'identity', m:''},
                    state:{}
                }
            },
            form:{f:'fame', c:'identity', m:''},
            state:{fearless:0}
        })
    })


})

describe('Tree reduction', function(){

    pending("removal of logs and use")

    let defaults = {
        a:{
            alpha:'a',
            beta:'b'
        },
        b:[2,3,5],
        c:{
            x:2,
            y:"everafter",
            z:'too much'
        }
    }

    let data = {
        a:{
            alpha:'actual',
            beta:'belt'
        },
        b:[7,11,13],
        c:{
            x:2,
            y:['twaddle']
        }
    }

    let expected = {
        a:{
            alpha:'actual',
            beta:'belt'
        },
        b:[2,3,5,7,11,13],
        c:{
            x:4,
            y:'everafter["twaddle"]',
            z:'too much'
        }
    }

    let blender = B({
        b:B([],{
            term:true,
            reducer(a,b){return a.concat(b)}
        }),
        c:{
            x(a, b){return a+b},
            y:B(undefined,{
                term:true,
                mapper(x){return JSON.stringify(x)},
                reducer(a, b){return a+b}
            })
        }
    },{
        mapper(x, churn){
            //console.log("base mapper:",x)
            return x
        }
    });

    it('should reduce',function(){
        blender.init(defaults);
        let actual = blender.blend(data).dump();

        console.log('actual result:', actual);
        console.log('expected result:', expected);

        Util.deeplyEqualsThrow(expected, actual);
    })
})
