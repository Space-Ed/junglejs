namespace Jungle {

    export namespace IO {

        export enum LINK_FILTERS {
            PROCEED, DECEED, ELSEWHERE, NONE
        }

        export interface ILinkRule {
            designatorA:CruxDesignator;
            designatorB:CruxDesignator;
            closeSource:boolean;
            closeSink:boolean;
            matching:boolean;
            propogation:LINK_FILTERS;
        }

        export interface IMeshInitialiser {
            membranes:any,
            rules:any,
            exposed:any
        }

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

        export interface ShellPolicy {
            fussy:boolean;
            allowAddition:boolean;
            allowRemoval:boolean;

        }

        export const FreePolicy:ShellPolicy = {
            fussy:false,
            allowAddition:true,
            allowRemoval:true
        }

        export interface MembraneHost{
            policy:ShellPolicy;

            onAddCrux:(crux:Crux, role:string, token:string)=>void;
            onRemoveCrux:(crux:Crux, role:string, token:string)=>void;

            onAddMembrane:(membrane:Membrane, token)=>void;
            onRemoveMembrane:(membrane:Membrane, token)=>void;

        }

        export interface CruxDesignator{
            role:string;
            mDesignators:string[]|RegExp[]|((membrane:Membrane, key:string)=>boolean)[];
            cDesignator:string|RegExp|((crux:Crux)=>boolean);
        }


    }

}
