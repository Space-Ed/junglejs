/// <reference path="../base/construct.ts"/>

namespace Jungle {
    export namespace Nova {
        export class Composite extends Construct<any> {

            crown:any;

            constructor(spec:ConstructSpec){
                super(spec);
                this.crown = {};
            }

            prime(){
                this.alive = true;

                for(let k in this.cache.patch){
                    let v = this.cache.patch[k];
                    this.add(k, v);
                }
            };

            add(k, v){
                this.cache[k] = v;

                if(this.alive){
                    //coerce all types into construct specs

                    let spec;
                    try{
                        spec = normalise(k, v);
                    }catch(e){
                        //handling of strange values.
                        return
                    }

                    //recover using the domain given
                    let construct = this.domain.recover(spec);

                    //Let the construct manage it's integration.
                    construct.induct(this, k);

                    //recursively
                    construct.prime();
                }
            }

            remove(k){
                let removing = <Construct<Composite>>this.crown[k];

                if(removing !== undefined){
                    let final = removing.dispose();
                    delete this.crown[k];
                    return final
                }

            }

            /*
                Called at the end of life of the construct,
                should return it's final form, and also return to being a pattern
                it should retract any changes it enacted on the parent.
            */
            dispose():any{

                for (let key in this.crown) {
                    let construct = this.crown[key]
                    construct.dispose()
                }
            }

            /*
                output a representation of the construct that may be recovered to a replication
            */
            extract():ConstructSpec {
                let extracted = {}

                for (let key in this.crown) {
                    let construct = this.crown[key]
                    extracted[key] = construct.extract();
                }

                return this.cache
            }

            graft(patch){

            }

            /*
                as an unprimed construct{pattern} this may occur to create an extended version.
            */
            extend(patch):Construct<any> {

                let ext = Util.B()
                    .init(this.extract())
                    .merge({patch:patch})
                    .dump();

                return this.domain.recover(ext)

            }

        }
    }
}
