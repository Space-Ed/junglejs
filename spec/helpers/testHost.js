let Jungle = require('../../build/jungle.js');
let {Membrane, CallIn, CallOut, DemuxWatchMethodsF} = Jungle.IO;

(function(){

    class TestHost {

        constructor(name){
            this.name = name


            this.changeOccurred = DemuxWatchMethodsF(this)
            this.primary = new Membrane()
            this.primary.addWatch(this)

            this.policy = Jungle.IO.FreePolicy

            this.addspy = jasmine.createSpy()
            this.remspy = jasmine.createSpy()
            this.membaddspy = jasmine.createSpy()
            this.membremspy = jasmine.createSpy()

        }

        onAddContact(crux, token){
            this.addspy(crux, token)
        }

        onRemoveContact(crux,token){
            this.remspy(crux,  token)
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
                        this.primary.addContact(label, new CallIn({label:label, tracking:true}))
                    }
                    if(out == '_'){
                        this.primary.addContact(label, new CallOut({label:label, tracking:true}))
                    }

                }else{
                    throw new Error(`Invalid port label ${labels[i]}, must be _<sink label> (leading underscore) or <source label>_ (trailing underscore)`)
                }
            }
        }
    }
    module.exports = TestHost
})()
