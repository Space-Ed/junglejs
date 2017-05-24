

namespace Jungle {
    export namespace IO {

        export class DistributeMedium extends BaseMedium<Caller, Called> {
            roleA:string;
            roleB:string;

            constructor(spec:IMediumSpec){
                super(spec);

                this.roleA = 'caller'
                this.roleB = 'called'
            }

            distribute(sourceToken:string, data:any, crumb){
                for(let sinkToken in this.matrix.to[sourceToken]){
                    let source = this.matrix.to[sourceToken];
                    let outrole = source[sinkToken].roleB
                    outrole.func(data, crumb)
                }
            }

            inductA(token:string, a:Caller){
                a.func = this.distribute.bind(this, token)
            }

            inductB(token:string, b:Called){
            }

            connect(link: ILinkSpec<Caller, Called>){
            }

            disconnect(link: ILinkSpec<Caller, Called>){
                super.disconnect(link)
                link.roleA.func = undefined;
            }
        }

        mediaConstructors['distribute'] = DistributeMedium;
    }
}
