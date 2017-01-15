namespace Gentyl {
    export namespace Actions {
        export class Component {

            constructor(private host:BaseNode){

            }
            /**
                add an extremity to the structure
             */
            add(keyOrVal, val){
                this.host.inductComponent(val)

                let al = arguments.length
                var ins = null

                if(!(al === 1 || al === 2)){
                    throw Error("Requires 1 or 2 arguments")
                }else if(al === 1){
                    if (this.host.crown instanceof Array){
                        ins = this.host.crown.length;
                        this.host.crown.push(val)
                    }else if(Util.isVanillaObject(this.host.crown)){
                        throw Error("Requires key and value to add to object crown")
                    }else if(this.host.crown instanceof Terminal){
                        if(this.host.crown.check(val)){
                            this.host.crown = val;
                        }
                    }else{
                        throw Error("Unable to clobber existing value")
                    }
                }else {
                    if(Util.isVanillaObject(this.host.crown)){
                        ins = keyOrVal;
                        this.host.crown[keyOrVal] = val;
                    }else{
                        throw Error("Requires single arg for non object crown")
                    }
                }


                // CONTROVETIAL
                // //when the structure is prepared as must be the child added.
                // if(this.host.prepared){
                //     this.host.crown[ins] = this.host.prepareChild(null, this.host.crown[ins])
                // }
            }

        }
    }

}
