import * as I from '../interfaces'

export abstract class BaseMedium <A extends I.Contact,B extends I.Contact> implements I.Medium<A,B>{
    exclusive = false;
    multiA = true;
    multiB = true;
    reflex = true;
    symmetric:boolean;

    abstract typeA:Function;
    abstract typeB:Function;

    matrix:{
        to:any;
        from:any;
    };

    exposed:any

    constructor(spec:I.MediumSpec){
        this.matrix = {to:{},from:{}}
        this.exposed = spec.exposed || {};
        this.symmetric = this.typeA === this.typeB;
        this.typeB = this.symmetric ? undefined: this.typeB; //you're actually creating undefined?
    }

    /**
     * Called to suppose whether a link will take place after filtering and validation
     */
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
        return token in this.matrix.to || token in this.matrix.from
    }

    /*
        determine that a certain link is present in a media, requiring both tokens to be represented
    */
    hasLink(link:I.LinkSpec<A,B>):boolean{
        if(link.tokenA in this.matrix.to && this.matrix.to[link.tokenA][link.tokenB] !== undefined){
            return this.matrix.to[link.tokenA][link.tokenB] === this.matrix.from[link.tokenB][link.tokenA];
        }
    }

    /**
     * determine whether this media hold an exclusive claim over either of the contacts in question for the link
     */
    hasClaim(link:I.LinkSpec<A,B>):boolean{
        return this.exclusive && (link.tokenA in this.matrix.to || link.tokenB in this.matrix.from)
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
        return  link.contactA instanceof this.typeA && link.contactB instanceof this.typeB //is of the appropriate type
        &&
        (this.multiA || ( this.matrix.to[link.tokenA]==undefined) || this.matrix.to[link.tokenA][link.tokenB] === undefined) // Is fanning out or not out linked
        &&
        (this.multiB || (this.matrix.from[link.tokenB]== undefined)||this.matrix.from[link.tokenB][link.tokenA] === undefined);//Is fanning in or not linked i

    };

    abstract inductA(token:string, a:A);
    abstract inductB(token:string, b:B);
    abstract connect(link: I.LinkSpec<A,B>);

    disconnect(link: I.LinkSpec<A,B>){
        delete this.matrix.to[link.tokenA][link.tokenB];
        delete this.matrix.from[link.tokenB][link.tokenA];
    };

}

export const mediaConstructors = {}
