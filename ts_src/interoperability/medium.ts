namespace Jungle {

    export namespace IO {


        export interface IMedium<A,B>{
            roleA:string,
            roleB:string,
            teardown():void,
            inductA(token:string, a:A):void,
            inductB(token:string, b:B):void,
            check(tokenA:string, roleA:A, tokenB:string, roleB:B):boolean,
            connect(tokenA:string, roleA:A, tokenB:string, roleB:B):void,
            disconnect(tokenA:string, roleA:A, tokenB:string, roleB:B):void
        }

        export class BareMedium<A,B> implements IMedium<A,B>{
            roleA:undefined;
            roleB:undefined;

            constructor(public host){

            }

            setup(){

            }

            teardown(){

            }
            inductA(token:string, a:A){

            }
            inductB(token:string, b:B){

            }
            check(tokenA:string, roleA:A, tokenB:string, roleB:B){
                return false
            }
            connect(tokenA:string, roleA:A, tokenB:string, roleB:B){

            }
            disconnect(tokenA:string, roleA:A, tokenB:string, roleB:B){

            }
        }

        export class PushMedium implements IMedium<SourceRole,SinkRole>{
            roleA:'source'
            roleB:'sink'

            outlinks:any;

            constructor(public ctx){
                this.outlinks = {};
            }

            distribute(sourceToken:string, data:any){
                for(let sinkToken in this.outlinks[sourceToken]){
                    let outrole = this.outlinks[sourceToken][sinkToken]

                    outrole.put(data)
                }
            }

            teardown(){
                this.outlinks = undefined;
            }

            inductA(token:string, a:SourceRole){
                this.outlinks[token] = {};
                a.callout = this.distribute.bind(this, token)
            }

            inductB(token:string, b:SinkRole){
            }

            check(tokenA:string, roleA:SourceRole, tokenB:string, roleB:SinkRole){
                return true
            }
            connect(tokenA:string, roleA:SourceRole, tokenB:string, roleB:SinkRole){
                this.outlinks[tokenA][tokenB] = roleB
            }

            disconnect(tokenA:string, roleA:SourceRole, tokenB:string, roleB:SinkRole){
                delete this.outlinks[tokenA][tokenB]
            }

        }

        export const media = {
            'source->sink':PushMedium
        }

    }
}
