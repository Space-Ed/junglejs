namespace Jungle {

    export namespace IO {


        /**
        A crux for passing a request through to an assignable
         */
        export class RequestCrux extends Crux{

            roles:{
                req:Request,
                resp:Response
            }

            constructor(label:string){
                super(label)

                //appointment of roles
                this.roles = {
                    req:{
                        request:undefined
                    },resp:{
                        response:(data:any, tracking:Debug.Crumb)=>{
                            let crumb = tracking.drop("Request Crux")
                                .with(data)
                                .at(this.label)

                            if(this.roles.req.request != undefined){
                                return this.roles.req.request(data, crumb);
                            }else{
                                //hitting a contact without connection, a call to void
                                tracking.raise("You didn't make it ")
                            }
                        }
                    }
                }
            }
        }
    }
}
