var jungle = require('../dist/jungle')
var G = jungle.G;
var T = jungle.T;

/*

    this is the specification for explicitly declaring undetermined positions for extention that
    prevent preparation. They are a feature for allowing prepare to be a static check for completeness of a structure.
    They define a valid action in the extention of raw structures.
*/

describe("nullTerminals", function(){
    var g

    beforeEach(function(){
        g = new G({
            perp:T()
        })
    })

    it("should permit single null value to be prepared and resolved",function(){
        var g2 = G(undefined).prepare()
        expect(g2.resolve()).toBeUndefined();
    })

    it("should be able to check that any terminals are present",function(){
        var g2 = G(T())

        expect(g2.checkComplete()).toBe(false)
    });

    it("should be able to scan for terminals in structure", function(){

    });

    it("should throw an error trying to prepare the structure", function(){

    });

})
