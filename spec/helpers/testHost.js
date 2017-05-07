let Jungle = require('../../dist/jungle.js');
let {Membrane, PortCrux, Crux} = Jungle.IO;

(function(){

    class TestHost {

        constructor(name){
            this.name = name

            this.primary = new Membrane(this, ['source', 'sink'])
            this.policy = Jungle.IO.FreePolicy

            this.addspy = jasmine.createSpy()
            this.remspy = jasmine.createSpy()
            this.membaddspy = jasmine.createSpy()
            this.membremspy = jasmine.createSpy()

        }

        onAddCrux(crux,role,token){
            this.addspy(crux, role, token)
        }

        onRemoveCrux(crux,role,token){
            this.remspy(crux, role, token)
        }

        onAddMembrane(membrane, token){
            this.membaddspy(membrane, token)
        }

        onRemoveMembrane(membrane, token){
            this.membremspy(membrane, token)
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
    module.exports = TestHost
})()
