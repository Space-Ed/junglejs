/// <reference path="../../dist/gentyl.d.ts"/>
/// <reference path="../../typings/globals/jasmine/index.d.ts"/>

var G = require("../dist/gentyl.js");
var g = G.G;

describe("operationality", function () {


    it("should be present", function () {
        expect(g).not.toBeUndefined();
    });


    it("should generate a single object with string properties", function () {
        var gen = g({
            a: "stringa",
            b: "stringb"
        },{
            r(obj) {
                return obj;
            }
        })

        var res = gen.resolve();
        expect(res).toEqual({ a: "stringa", b: "stringb" });
    });


    it("should generate from context properties", function(){
        var gen = g({}
            ,{
                r(obj){
                    return this.prop;
                }
            },{
                prop:"value"
            }
        )

        var res = gen.resolve();
        expect(res).toEqual("value")
    })

    it("should generate from changing context properties", function(){
        var gen = g({
                inc:1
            },{
                r(obj, args){
                    this.prop += obj.inc;
                    return this.prop;
                }
            },
            {
                prop:0
            }
        )

        var res = gen.resolve();
        expect(res).toEqual(1);
        res = gen.resolve();
        expect(res).toEqual(2);

    })

    it("should generate from arg set context properties", function(){
        var gen = g({
        },{
            r(obj, arg){

                if(arg == undefined){
                    return this.prop
                }else{
                    this.prop = arg;
                    return "set"
                }
            }
        },{
            prop:0
        }).prepare();

        var res = gen.resolve(1);
        expect(res).toEqual("set");

        res = gen.resolve();
        expect(res).toEqual(1);

    })
});

describe("recursability",function(){
    it("should return a deep object",function(){
        var gen = g({
            o1:{
                o2:{
                    prop:0
                }
            }
        }).prepare();

        var res = gen.resolve();
        expect(res).toEqual({
            o1:{
                o2:{
                    prop:0
                }
            }
        });
    })

    it("should have ability to recurse arrays", function(){
        var gen = g([
            g([
                1,2,3
            ]),
            g([
                6,7
            ]),
            4,
            5
        ]).prepare();

        var res = gen.resolve();
        expect(res).toEqual([[1,2,3],[6,7],4,5]);
    })

    it('should not allow sharing between distinct trees',function(){
        var subg = g({
        },{
            r(obj, arg){
                this.prop.inner+=1;
                return this.prop.inner;
            }
        },{
            prop:{
                inner:0
            }
        })

        var gen = g({
            ghost:subg
        }).prepare();

        var gen2 = g({
            ghost:subg
        }).prepare();

        var res = gen.resolve();
        expect(res.ghost).toEqual(1);

        res = gen2.resolve();
        expect(res.ghost).toEqual(1);
    })
})
