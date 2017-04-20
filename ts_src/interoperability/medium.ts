namespace Jungle {

    export namespace IO {


        export interface IMedium<A,B>{
            roleA:string,
            roleB:string,
            check:(a:A,b:B)=>boolean,
            connect:(a:A, b:B)=>void,
        }

        export const media:{
            pushThrough:IMedium<SourceRole,SinkRole>
        } = {
            pushThrough:{
                roleA:'source',
                roleB:'sink',
                check(a,b){
                    return true,
                },
                join(a,b){
                    a.as.source
                }

            }

        }

    }
}
