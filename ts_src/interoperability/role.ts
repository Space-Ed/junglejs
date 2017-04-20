namespace Jungle {

    export namespace IO {

        /**
         * The properties required for roles.
         */
        export interface IRole<I> {
            name:string,
            inversion:string,
            fusion:(a:I, b:I)=>I
        }

        export interface SourceRole {
            callout:((data:any)=>void)[]
        }

        export interface SinkRole {
            put:(data:any)=>void
        }

        export const staticRoles:{
            source:IRole<SourceRole>,
            sink:IRole<SinkRole>
        } = {
            source:{
                name:'source',
                inversion:'sink',
                fusion(a, b){
                    return {callout:a.callout.concat(b.callout)}
                }
            },
            sink:{
                name:'sink',
                inversion:'source',
                fusion(a,b){
                    return a;
                }
            }
        }

    }
}
