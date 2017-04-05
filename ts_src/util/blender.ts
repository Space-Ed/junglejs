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

            constructor(public crown, form:any={}){
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
                    this.crown = typeCaseSplitF(this.initChurn.bind(this))(obj);
                }else{
                    this.crown = obj;
                }
                return this
            }

            initChurn(inner, k){
                var result

                if(k === undefined && Util.isPrimative(inner)){
                    result = inner;
                    this.term = inner !== undefined;
                }else if(k in this.crown){
                    let val = this.crown[k];
                    if(val instanceof Blender){
                        result = val.init(inner);
                    }
                    else if(val instanceof Function){
                        result = B(undefined, val).init(inner);
                    }
                    else{
                        //undefined, object, array, primative... use inherited reduction strategy,
                        //convert an existing object or terminal to a blender and initialise
                        result = B(this.crown[k], {mapper:this.mapper, reducer:this.reducer}).init(inner);
                    }
                }else{ //introduce
                    result = B(undefined, {mapper:this.mapper, reducer:this.reducer}).init(inner);
                }

                return result;

            }

            dump(){
                if(this.term){
                    return this.crown;
                }else{
                    return typeCaseSplitF(function(child){
                        return child !== undefined ? child.dump() : undefined
                    })(this.crown);
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
                    //console.log('updated reduced:', reduced);
                }else{
                    reduced = this.merge(mapped);
                    //console.log('updated recursed:', reduced);
                }

                return reduced;
            }

            /*
                handles the default merge situation and recur through churn
            */
            merge(income){

                //console.log("merge:  income = ", income , "this.crown = " ,this.crown);

                let result, superkeys
                if(this.crown === undefined && income !== undefined){ //only crown is undefined, initialise
                    this.init(income);
                    return income
                }else if (income !== undefined){//both crown and income are defined.
                    if(this.crown instanceof Array){
                        result =[]; superkeys = Util.range(Math.max((income||[]).length||0,this.crown.length));
                    }else{
                        result = {}; superkeys = Object.keys(this.crown || {});

                        Object.keys(income || {}).forEach(key=>{
                            if(superkeys.indexOf(key) === -1){
                                superkeys.push(key);
                            }
                        });
                    }
                    //console.log('total keys', superkeys, "  income: ", income);

                    for(let key of superkeys){
                        if (key in income ){
                            if(key in this.crown){ //Blend
                                //console.log("blend denizen", this.crown[key], " income: ", income)
                                result[key] = this.crown[key]._blend(income[key]);
                            }else{  // Introduction
                                //console.log("introduction crown: ", this.crown[key], " income: ", income)
                                this.crown[key] = B(undefined, {mapper:this.mapper, reducer:this.reducer}).init(income[key]);
                                result[key] = this.crown[key].dump();
                            }
                        }else if(key in this.crown){ //Retroduction
                            //console.log("retroduction crown: ", this.crown[key], " income: ", income[key])
                            result[key] = this.crown[key].dump();
                        }else {
                            //impossible
                        }
                    }

                    return result
                }
            }


        }

    }
}
