namespace Jungle {

    export namespace Util {

        export function B(crown={}, form:any={}){
            return new Blender(crown, form);
        }

        export class Blender {

            static strictTypeReduce = false;

            static defaultReduce(a, b){

                if(Blender.strictTypeReduce && (typeof(a) != typeof(b))){
                    var errmsg = "Expected melding to be the same type \n"+
                                "existing: "+a+"\n"+
                                "incoming: "+b+"\n"
                    throw TypeError(errmsg)
                }

                return b === undefined ? a : b;
            };

            static defaultMap(x){
                return x;
            }

            block:boolean;
            term:boolean

            /*
                standart terminal reduction, override to b unless a is defined and b isn't, b can only override similar type;
            */
            reducer:(a,b)=>any;
            mapper:(a)=>any;

            constructor(public crown={}, form:any={}){
                if(form instanceof Function){
                    this.reducer = form
                }else if (form.reducer instanceof Function){
                    this.reducer = form.reducer;
                }else{
                    this.reducer = Blender.defaultReduce;
                }

                this.block = form.block || false;
                this.term = form.term || false;
                this.mapper = form.mapper || Blender.defaultMap;
            }

            init(obj):Blender{
                if(this.term === false){
                    typeCaseSplitF(this.initChurn.bind(this))(obj);
                }else{
                    this.crown = obj;
                }
                return this
            }

            initChurn(inner, k){
                if(k === undefined){
                    this.crown = inner;
                    this.term = true;
                }else if(k in this.crown){
                    let val = this.crown[k];
                    if(val instanceof Blender){
                        val.init(inner);
                    }
                    else if(val instanceof Function){
                        this.crown[k] = B(undefined, val).init(inner);
                    }
                    else{
                        //undefined, object, array, primative... use inherited reduction strategy,
                        //convert an existing object or terminal to a blender and initialise
                        this.crown[k] = B(this.crown[k], {mapper:this.mapper, reducer:this.reducer}).init(inner);
                    }
                }else{ //convert
                    this.crown[k] = B(undefined, {mapper:this.mapper, reducer:this.reducer}).init(inner);
                }
            }

            dump(){
                if(this.term){
                    return this.crown;
                }else{
                    return typeCaseSplitF(function(child){return child.dump()})(this.crown);
                }

            }

            blend(obj){
                this._blend(obj)
                return this
            }

            private _blend(obj):Blender{
                let mapped = this.mapper(obj);

                let reduced;
                if(this.term){
                    reduced = this.reducer(this.crown, mapped);
                    this.crown = reduced;
                    console.log('updated reduced:', reduced);
                }else{
                    reduced = this.merge(mapped);
                    console.log('updated recursed:', reduced);
                }

                return reduced;
            }

            /*
                handles the default merge situation and recur through churn
            */
            merge(income){

                let superkeys;
                superkeys = Object.keys(this.crown || {});
                superkeys = Object.keys(income || {}).reduce(
                    (collected, current, i , array) => {
                        return ((array.indexOf(current) === -1)
                        ?
                            collected.concat(current):collected
                        )
                    }
                    , superkeys);

                console.log('total keys', superkeys, "  income: ", income);

                //reduced type and catching miss case
                let result = this.crown instanceof Array ? [] : {};
                for(let key of superkeys){
                    if (income === undefined || income[key] === undefined){
                        result[key] = this.churn(undefined, key);
                    }else{
                        result[key] = this.churn(income[key], key);
                    }
                }
                return result;
            }

            /*
                handles the subsume and extention of crown
                returns the blended inside or the
                modifies
            */
            churn(inner, k){
                console.log("churn, inner:", inner, " , k:", k);

                let churned;
                if(inner === undefined){
                    churned = this.crown[k].dump();
                }else if(k in this.crown){//case for recursive blend with own crown
                    console.log('recursive blend', inner);
                    churned = this.crown[k]._blend(inner);
                }else{ //crown does not have key so introduce a new blender and initialise, then dump the contents
                    this.crown[k] = B(undefined, {mapper:this.mapper, reducer:this.reducer}).init(inner);
                    churned = this.crown[k].dump();
                }
                return churned;
            }

        }

    }
}
