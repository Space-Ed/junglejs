namespace Jungle {

    export namespace IO {

        export interface SourceRole {
            callout:(data:any)=>void
        }

        export interface SinkRole {
            put:(data:any)=>void
        }


    }
}
