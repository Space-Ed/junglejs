namespace Jungle {

    export namespace IO {


        export interface IMedium<A,B>{
            label:string;
            roleA:string;
            roleB:string;

            breakA(token:string, a:A);
            breakB(token:string, b:B);
            hasClaim(link:ILinkSpec<A,B>):boolean;
            suppose(supposedLink: ILinkSpec<A,B>):boolean;
        }

        export interface ILinkSpec<A,B> {
            tokenA:string,
            tokenB:string,
            roleA:A,
            roleB:B,
            directed:boolean,
            destructive:boolean
        }

        export interface IMediumSpec {
            exclusive?:boolean;
            multiA?:boolean;
            multiB?:boolean;
            directedOnly?:boolean;

            exposed:any;
            label:string;
        }

    }

}
