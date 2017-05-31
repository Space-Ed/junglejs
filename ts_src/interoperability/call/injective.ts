
namespace Jungle {
    export namespace IO {

        export interface Called extends IContact {
            func:(data:any, tracking:Debug.Crumb)=>Util.Junction;
        }

        export interface Caller extends IContact {
            func?:(data:any, tracking:Debug.Crumb)=>Util.Junction;
        }

        export class InjectiveMedium extends BaseMedium<Caller, Called> {
            roleA:string;
            roleB:string;

            constructor(spec:IMediumSpec){
                super(spec);

                this.exclusive = true;
                this.roleA = 'caller'
                this.roleB = 'called'
                this.multiA = false,
                this.multiB = false
            }

            inductA(token:string, a:Caller){
            }

            inductB(token:string, b:Called){
            }

            connect(link: ILinkSpec<Caller, Called>){
                this.matrix.to[link.tokenA][link.tokenB].roleA.func = link.roleB.func
            }

            disconnect(link: ILinkSpec<Caller, Called>){
                this.matrix.to[link.tokenA][link.tokenB].roleA.func = undefined;
                super.disconnect(link);
            }
        }

        mediaConstructors['inject'] = InjectiveMedium
    }
}
