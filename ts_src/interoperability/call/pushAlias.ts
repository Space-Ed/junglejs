
namespace Jungle {
    export namespace IO {

        export class PortCrux extends CallCrux {

            roles:{
                caller:any,
                called:Called

                source:any;
                sink:Called
            }

            constructor(label){
                super({label:label, tracking:true});

                this.roles.source = this.roles.caller
                this.roles.sink = this.roles.called

            };
        }

        export class PushMedium extends DistributeMedium {
            roleA = "source";
            roleB = "sink";
        }

        mediaConstructors['source->sink'] = PushMedium;

    }
}
