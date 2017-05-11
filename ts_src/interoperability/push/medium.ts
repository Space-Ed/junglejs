

namespace Jungle {
    export namespace IO {

        export class PushMedium extends BaseMedium<SourceRole,SinkRole> {
            roleA:string;
            roleB:string;

            constructor(spec:IMediumSpec){
                super(spec);

                this.roleA = 'source'
                this.roleB = 'sink'
            }

            distribute(sourceToken:string, data:any){
                for(let sinkToken in this.matrix.to[sourceToken]){
                    let outrole = this.matrix.to[sourceToken][sinkToken].roleB
                    outrole.put(data)
                }
            }

            inductA(token:string, a:SourceRole){
                a.callout = this.distribute.bind(this, token)
            }

            inductB(token:string, b:SinkRole){
            }

            connect(link: ILinkSpec<SourceRole, SinkRole>){
                this.matrix.to[link.tokenA][link.tokenB].outhook = link.roleB
            }

            disconnect(link: ILinkSpec<SourceRole, SinkRole>){
                super.disconnect(link)
                link.roleA.callout = undefined;
            }
        }

        mediaConstructors['source->sink'] = PushMedium;
    }
}
