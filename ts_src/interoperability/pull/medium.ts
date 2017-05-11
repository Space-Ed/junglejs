
namespace Jungle {
    export namespace IO {

        export interface Request {
            request:(data:any, tracking:Debug.Crumb)=>Util.Junction;
        }

        export interface Response {
            response:(data:any, tracking:Debug.Crumb)=>Util.Junction
        }

        export class PullMedium extends BaseMedium<Request, Response> {
            roleA:string;
            roleB:string;

            constructor(spec:IMediumSpec){
                super(spec);

                this.exclusive = true;
                this.roleA = 'req'
                this.roleB = 'resp'
                this.multiA = false,
                this.multiB = false
            }

            inductA(token:string, a:Request){
            }

            inductB(token:string, b:Response){
            }

            connect(link: ILinkSpec<Request, Response>){
                this.matrix.to[link.tokenA][link.tokenB].roleA.request = link.roleB.response
            }

            disconnect(link: ILinkSpec<Request, Response>){
                this.matrix.to[link.tokenA][link.tokenB].roleA.request = undefined;
                super.disconnect(link);
            }
        }

        mediaConstructors['req->resp'] = PullMedium
    }
}
