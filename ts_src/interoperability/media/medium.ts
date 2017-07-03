import * as I from '../interfaces'

export abstract class BaseMedium <A extends I.Contact,B extends I.Contact> implements I.Medium<A,B>{
    exclusive = false;
    multiA = true;
    multiB = true;

    abstract typeA:Function;
    abstract typeB:Function;

    matrix:{
        to:any;
        from:any;
        sym:any;
    };

    exposed:any

    constructor(spec:I.MediumSpec){
        this.matrix = {to:{},from:{},sym:{}}
        this.exposed = spec.exposed || {};
    }

    suppose(supposedLink: I.LinkSpec<A,B>):boolean{

        if(this.check(supposedLink)){

            let {tokenA, tokenB, contactA, contactB} = supposedLink;

            //introduce contacts to the medium
            if(this.matrix.to[tokenA] === undefined){
                this.matrix.to[tokenA] = {};
                this.inductA(tokenA, contactA);
            }

            if(this.matrix.from[tokenB] === undefined){
                this.matrix.from[tokenB] = {};
                this.inductB(tokenB, contactB);
            }

            //create link in matrix
            this.matrix.to[tokenA][tokenB] = supposedLink;
            this.matrix.from[tokenB][tokenA] = supposedLink;

            //call the linking method
            this.connect(supposedLink)

            //link success
            return true
        }else{
            //link failure
            return false
        }
    }

    /*
        determine if the medium has the token in any position
    */
    hasToken(token:string):boolean{
        return token in this.matrix.to || token in this.matrix.from || token in this.matrix.sym
    }

    /*
        determine that a certain link is present in a media, requiring both tokens to be represented
    */
    hasLink(link:I.LinkSpec<A,B>):boolean{
        if(link.directed){
            if(link.tokenA in this.matrix.to && this.matrix.to[link.tokenA][link.tokenB] !== undefined){
                return this.matrix.to[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA];
            }else{
                return false
            }
        }else{
            if(link.tokenA in this.matrix.sym ){
                return this.matrix.sym[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA]
            }else{
                return false
            }
        }
    }

    /**
     * determine whether this media hold an exclusive claim over either of the contacts in question for the link
     */
    hasClaim(link:I.LinkSpec<A,B>):boolean{
        return this.exclusive && (link.directed && (link.tokenA in this.matrix.to || link.tokenB in this.matrix.from))
        || (!link.directed && link.tokenA in this.matrix.sym )
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

    check(link: I.LinkSpec<A,B>){
        //check fan out

        if(link.directed){
            return  link.contactA instanceof this.typeA && link.contactB instanceof this.typeB //is of the appropriate type
                &&
                    (this.multiA || ( this.matrix.to[link.tokenA]==undefined) || this.matrix.to[link.tokenA][link.tokenB] === undefined) // Is fanning out or not out linked
                &&
                    (this.multiB || (this.matrix.from[link.tokenB]== undefined)||this.matrix.from[link.tokenB][link.tokenA] === undefined);//Is fanning in or not linked i
        }else{
            return link.contactA instanceof this.typeA && link

            (this.multiA || this.matrix.sym[link.tokenA][link.tokenB] === undefined)&&
            (this.multiB || this.matrix.sym[link.tokenB][link.tokenA] === undefined)
        }
    };

    abstract inductA(token:string, a:A);
    abstract inductB(token:string, b:B);
    abstract connect(link: I.LinkSpec<A,B>);

    disconnect(link: I.LinkSpec<A,B>){
        if(link.directed){
            delete this.matrix.to[link.tokenA][link.tokenB];
            delete this.matrix.from[link.tokenB][link.tokenA];
        }
    };

}

export const mediaConstructors = {}
