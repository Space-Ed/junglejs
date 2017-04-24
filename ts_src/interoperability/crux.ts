namespace Jungle {

    export namespace IO {

        export class Crux {

            //the complete map of roles to membranes that refer to this under that role
            appearances:any;

            //the components of this serving roles
            roles:any;

            constructor(public label:string, public membrane:Membrane, public role:string){
                this.roles = {}
                this.appearances = {}
                this.attachTo(membrane, role)
            }

            /**
             * Used for internal context access,
             */
            getContext(){
                return this.membrane.host.retrieveContext(this);
            }

            /**
             * @param role: what is this on the other side.
             */
            inversion(role:string):string{
                return role
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

            detachAll(){
                for (let role in this.appearances){
                    let appearsIn = this.appearances[role];

                    this.detachFrom(appearsIn, role)
                }
            }

            destroy(){
                this.detachAll();

                for (let key in this.roles) {
                    this.roles[key].destroy();
                }
            }

        }

    }
}
