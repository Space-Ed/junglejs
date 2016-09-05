/// <reference path="../../dist/gentyl.d.ts"/>
/// <reference path="../../typings/globals/jasmine/index.d.ts"/>

var G = require("../dist/gentyl.js");

var g = G.g;

describe("operationality", function () {


    it("should be present", function () {
        expect(g).not.toBeUndefined();
        expect(G.sA).not.toBeUndefined();
    });


    it("should generate a single object with string properties", function () {
        var gen = g( {
            a: "stringa",
            b: "stringb"
        }, function (obj) {
            return obj;
        });
        var res = gen.resolve();
        expect(res).toEqual({ a: "stringa", b: "stringb" });
    });


    it("should generate from context properties", function(){
        var gen = g(  {
                _prop:"value"
            },function(obj){
                return this.prop;
            }
        );

        var res = gen.resolve();
        expect(res).toEqual("value")
    })

    it("should generate from changing context properties", function(){
        var gen = g(  {
                _prop:0,
                inc:1
            },function(obj, args){
                this.prop += obj.inc;
                return this.prop;
            }
        );

        var res = gen.resolve();
        expect(res).toEqual(1);
        res = gen.resolve();
        expect(res).toEqual(2);

    })

    it("should generate from arg set context properties", function(){
        var gen = g({
            _prop:0
        },function(obj, arg){

            if(arg == undefined){
                return this.prop
            }else{
                this.prop = arg;
                return "set"
            }
        });

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
        });

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
            4,
            5
        ]);

        var res = gen.resolve();
        expect(res).toEqual([[1,2,3],4,5]);
    })
})
