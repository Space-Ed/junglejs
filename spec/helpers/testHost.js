let Jungle = require('../../dist/jungle.js');
let {Membrane, CallCrux, Crux, RequestCrux} = Jungle.IO;

(function(){

    class TestHost {

        constructor(name){
            this.name = name

            this.primary = new Membrane(this)
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
         * Parse the standard IO name format _sinkname sourcename_ and plant them respectively
         */
        populate(labels){
            var validPortRegex = /^([_\$]?)([a-zA-Z](?:\w*[a-zA-Z])?)([_\$]?)$/
            for (let i = 0; i < labels.length; i++) {
                let pmatch = labels[i].match(validPortRegex);

                if(pmatch){
                    let inp = pmatch[1], label = pmatch[2], out = pmatch[3];

                    if(inp == '_'){
                        this.primary.addCrux(new CallCrux({label:label, tracking:true}), "called")
                    }
                    if(out == '_'){
                        this.primary.addCrux(new CallCrux({label:label, tracking:true}), "caller")
                    }

                }else{
                    throw new Error(`Invalid port label ${labels[i]}, must be _<sink label> (leading underscore) or <source label>_ (trailing underscore)`)
                }
            }
        }
    }
    module.exports = TestHost
})()
