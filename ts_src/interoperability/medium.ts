namespace Jungle {

    export namespace IO {

        export abstract class BaseMedium <A,B> implements IMedium<A,B>{
            exclusive = false;
            multiA = true;
            multiB = true;

            label:string;

            abstract roleA:string;
            abstract roleB:string;

            matrix:{
                to:any;
                from:any;
                sym:any;
            };

            exposed:any

            constructor(spec:IMediumSpec){
                this.matrix = {to:{},from:{},sym:{}}
                this.label = spec.label;
                this.exposed = spec.exposed || {};
            }

            suppose(supposedLink: ILinkSpec<A,B>):boolean{

                let {tokenA, tokenB, roleA, roleB} = supposedLink;

                if(this.check(supposedLink)){
                    //check exclusivity and singularity

                    if(this.matrix.to[tokenA] === undefined){
                        this.matrix.to[tokenA] = {};
                        this.inductA(tokenA, roleA);
                    }

                    if(this.matrix.from[tokenB] === undefined){
                        this.matrix.from[tokenB] = {};
                        this.inductB(tokenB, roleB);
                    }

                    this.matrix.to[tokenA][tokenB] = supposedLink;
                    this.matrix.from[tokenB][tokenA] = supposedLink;

                    this.connect(supposedLink)
                    return true
                }else{
                    return false
                }
            }

            hasClaim(link:ILinkSpec<A,B>):boolean{
                return this.exclusive && (link.directed && (link.tokenA in this.matrix.to)
                || (!link.directed && link.tokenA in this.matrix.sym))
            }

            breakA(token:string, a:A){
                let connections = this.matrix.to[token];

                for(let other in connections){
                    this.disconnect(connections[other])
                }


            }

            breakB(token:string, b:B){
                let connections = this.matrix.from[token];

                for(let other in connections){
                    this.disconnect(connections[other])
                }
            }

            abstract inductA(token:string, a:A);
            abstract inductB(token:string, b:B);
            abstract check(supposedLink: ILinkSpec<A,B>);
            abstract connect(link: ILinkSpec<A,B>);

            disconnect(link: ILinkSpec<A,B>){
                console.log('disconnect')

                if(link.directed){
                    delete this.matrix.to[link.tokenA][link.tokenB];
                    delete this.matrix.from[link.tokenB][link.tokenA];
                }
            };

        }

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

            check(supposedLink: ILinkSpec<SourceRole, SinkRole>){
                return true
            }

            connect(link: ILinkSpec<SourceRole, SinkRole>){
                this.matrix.to[link.tokenA][link.tokenB].outhook = link.roleB
            }

            disconnect(link: ILinkSpec<SourceRole, SinkRole>){
                super.disconnect(link)
                link.roleA.callout = undefined;
            }
        }

        export const mediaConstructors = {
            'source->sink':PushMedium
        }

    }
}
