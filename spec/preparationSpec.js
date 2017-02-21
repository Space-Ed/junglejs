
var jungle = require('../dist/jungle.js');
var G = jungle.G;

describe("preparation",function(){
    var g;

    beforeEach(function(){
        g = G(
                G(
                    G({},{
                        x:"two use _",
                        p(parg){this.anteling = parg},
                        r(){ return this.anteling}
                }),{
                x:"one use _",
                p(parg){this.apparation = parg},
                r(obj){return  this.apparation + obj}
            }
        ),{
            p(prepargs){
                this.creature = prepargs;
            },
            r(obj, arg){
                return this.creature + obj
            },
            x:'_',
            creature:"unsummoned",
            apparation:"faint",
            anteling:"under"
        }).prepare("summon!");
    })

    it("should be deeply prepared",function(){
        expect(g.crown instanceof jungle.ResolutionCell).toBe(true)
    })

    it("should set properties with preparator",function(){
        expect(g.resolve()).toBe("summon!summon!summon!")
    })

    it('should reprepare',function(){
        pending("decision of how to treat repeated calls to prepare")
        g.prepare("again")
        expect(g.resolve()).toBe("againagainagain")
    })
})
