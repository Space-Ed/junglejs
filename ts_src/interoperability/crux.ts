namespace Jungle {

    export namespace IO {

        export class Crux {

            //the complete map of roles to membranes that refer to this under that role
            appearances:any;

            //the components of this serving roles
            roles:any;

            constructor(public label:string){
                this.roles = {}
                this.appearances = {}
            }

            produce(label:string):Crux{
                return new Crux(label)
            }

            /**
             * create a new crux that is a fusion of this and the argument
             */
            infuse(crux:Crux):Crux{
                let fused = this.produce(this.label);

                for(let role in this.roles){
                    fused.roles[role] = staticRoles[role].fusion(this.roles[role], crux.roles[role])

                    //attach to the concatenation of both prefusors
                    crux.appearances[role].concat(this.appearances[role]).forEach((membrane)=>{
                        fused.attachTo(membrane, role);
                    })
                }

                fused.postFuse()

                return fused

            }

            /**
             * exists to be overridden, called after a fusion to integrate fused changes
             */
            postFuse(){

            }

            /**
             * create links both ways, and when there is an existing
             */
            attachTo(membrane:Membrane, asRole:string){
                membrane.roles[asRole][this.label] = this;
                if(this.appearances[asRole].indexOf(membrane) === -1){
                    this.appearances[asRole].push(membrane)
                }
            }

            detachFrom(membrane:Membrane, asRole:string){
                membrane.roles[asRole][this.label] == undefined;

                let i = this.appearances[asRole].indexOf(membrane);

                if(i === -1){
                    this.appearances[asRole].splice(i, 1)
                }

            }

            destroy(){

            }

        }

    }
}
