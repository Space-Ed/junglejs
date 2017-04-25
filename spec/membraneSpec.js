

let Jungle = require('../dist/jungle.js');
let Membrane = Jungle.IO.Membrane;
let PortCrux = Jungle.IO.PortCrux;
let Crux = Jungle.IO.Crux;

class TestHost {

    constructor(name){
        this.name = name

        this.primary = new Membrane(this, ['source', 'sink'])
        this.policy = Jungle.IO.FreePolicy

    }

    retrieveContext(port){
        return this
    }

    /**
     * Take a designator object and, finding the sources, apply a coat
     */
    dress(designator, coat){
        designator.role = 'source'
        let designation = this.shell.designate(designator);
        for(let k in designation){
            let outport = designation[k];
            outport.dress(coat);
        }

    }

    /**
     * Parse the standard IO name format _sinkname sourcename_ and plant them respectively
     */
    populate(labels){
        var validPortRegex = /^(_?)([a-zA-Z](?:\w*[a-zA-Z])?)(_?)$/
        for (let i = 0; i < labels.length; i++) {
            let pmatch = labels[i].match(validPortRegex);

            if(pmatch){
                let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                if(inp){
                    this.primary.addCrux(new PortCrux(label, this, 'sink'), "sink")
                }
                if(out){
                    this.primary.addCrux(new PortCrux(label, this, 'source'), "source")
                }
            }else{
                throw new Error(`Invalid port label ${labels[i]}, must be _<sink label> (leading underscore) or <source label>_ (trailing underscore)`)
            }
        }
    }

}

describe('basic membrane', function(){

    let memb, host;

    beforeEach(function(){

        host =  new TestHost('host1-base')
        memb = host.primary
    })

    afterEach(function(){
    })

    fit('should allow addition and removal of ports', function(){
        let newb = new PortCrux('sinkA');
        let new2 = new PortCrux('source1')

        memb.addCrux(newb, 'sink');
        memb.addCrux(new2, 'source');

        expect(memb.roles.sink.sinkA).toBe(newb);
        expect(memb.roles.source.source1).toBe(new2);

        memb.removeCrux(newb, 'sink');
        memb.removeCrux(new2, 'source');

        expect(memb.roles.sink.sinkA).toBeUndefined();
        expect(memb.roles.sink.source1).toBeUndefined();
    })

    describe('designation', function(){
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
        })
        fit('populate works', function(){
            expect(memb.roles.sink.a).not.toBeUndefined();
            expect(memb.roles.sink.b).not.toBeUndefined();
            expect(memb.roles.source.y).not.toBeUndefined();
            expect(memb.roles.source.x).not.toBeUndefined();

        })

        fit('should designate with direct IR',function(){
            let a = memb.tokenDesignate({
                role:'sink',
                mDesignators:[],
                cDesignator:/.*/
            });

            expect(a[':a/sink'].label).toBe('a')
        })


    })

    fdescribe('inversion', function(){
        let invert;
        beforeEach(function(){
            host.populate(['_a', '_b', 'y_', 'x_'])
            invert = memb.invert();
        })

        it('should have inverted those cruxes already present', function(){
            let desall = invert.designate(":*", 'sink');

            expect(desall[':y/sink']).not.toBeUndefined();
            expect(desall[':x/sink']).not.toBeUndefined();
        })

        it('should invert further cruxes added', function(){
            memb.addCrux(new PortCrux('lame-o'), 'source');

            let desall = invert.designate(":*", 'sink');
            expect(desall[':lame-o/sink']).not.toBeUndefined();

            //a source in the inversion is a sink in the original
            invert.addCrux(new PortCrux('cool-cat'), 'source');
            let desallop = memb.designate(":*", 'sink');
            expect(desallop[':cool-cat/sink']).not.toBeUndefined();
        })

        it('should remove from both sides', function(){
            let desiga = invert.designate(':a','source', false);

            invert.removeCrux(desiga[0],'source');
            expect(invert.designate(':a', "source", false)[0]).toBeUndefined();

        })

    })

    describe('nested membranes', function(){
        let subhost, submemb

        beforeEach(function(){
            subhost = new TestHost('SubHost')

            submemb = subhost.primary;
            memb.addSubrane(submemb, 'sub')

            subhost.populate(['_a','x_']);
            host.populate(['_a', '_b', 'y_', 'x_'])
        })

        fit('should allow designation at depth', function(){

            let desig = memb.designate('sub:a', 'sink')
            expect(desig['sub:a/sink']).toBe(submemb.roles.sink.a)
        })

        fit('globbing should collect at many depths',function(){
            let sub2 = new Membrane(subhost)

            sub2.addCrux(new PortCrux('a'), 'sink');
            submemb.addSubrane(sub2, 'sub')

            let desig = memb.designate('sub.sub:a', 'sink')
            expect(desig['sub.sub:a/sink']).toBe(sub2.roles.sink.a)

            let desigAll = memb.designate('**.sub:a', 'sink')
            expect(desigAll['sub.sub:a/sink']).toBe(sub2.roles.sink.a)
            expect(desigAll['sub:a/sink']).toBe(submemb.roles.sink.a)
            //expect(desigAll[':a/sink']).toBe(memb.roles.sink.a)

        })

    })


})
