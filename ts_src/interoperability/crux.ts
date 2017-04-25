namespace Jungle {

    export namespace IO {

        export class Crux {

            static StandardInversions = {
                'source':'sink',
                'sink':'source',
                'master':'slave',
                'slave':'master'
            }

            originalMembrane:Membrane;
            inversionMembrane:Membrane;

            originalRole:string;
            inversionRole:string;

            //the components of this serving roles
            roles:any;

            constructor(public label:string){
                this.roles = {}
            }

            /**
             * Used for internal context access,
             */
            getContext(){
                return this.originalMembrane.host.retrieveContext(this);
            }

            /**
             * @param role: what is this on the other side.
             */
            inversion(role:string):string{
                return Crux.StandardInversions[role]
            }

            /**
             * create links both ways
             */
            attachTo(membrane:Membrane, asRole:string){
                this.originalMembrane = membrane;
                this.originalRole = asRole;

                let place = membrane.roles[asRole]||(membrane.roles[asRole]={})
                place[this.label] = this;

                this.inversionRole = this.inversion(asRole)

                if(membrane.inverted !== undefined && this.inversionRole !== undefined){
                    this.inversionMembrane = membrane.inverted;
                    let Iplace = this.inversionMembrane.roles[this.inversionRole]||(this.inversionMembrane.roles[this.inversionRole]={})
                    Iplace[this.label] = this;

                }
            }

            detach(){
                delete this.originalMembrane.roles[this.originalRole][this.label]

                if(this.inversionMembrane!==undefined){
                    delete this.inversionMembrane.roles[this.inversionRole][this.label]
                }
            }
        }

    }
}
