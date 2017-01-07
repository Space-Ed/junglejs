
var gentyl = require('../dist/gentyl.js');
var G = gentyl.G;

describe("preparation",function(){
    var g;

    beforeEach(function(){
        g = G(
            G(
                G(0,{
                    x:"use _",
                    p(parg){this.anteling = parg},
                    r(){ return this.anteling}
                }),{
                x:"use _",
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
        expect(g.crown instanceof gentyl.GNode).toBe(true)
    })

    it("should set properties with preparator",function(){
        expect(g.resolve()).toBe("summon!summon!summon!")
    })

    it('should reprepare',function(){
        pending("decision of how to treat repeated calls to prepare")
        g.prepare("again")
        expect(g.resolve()).toBe("againagainagain")
    })

    it("should deeply set properties - shared, child preference")

    it("should deeply set properties - isolated")
})
