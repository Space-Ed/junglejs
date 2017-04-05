/*

    This module addresses the problems with jungle system diagnosis and error reporting.

    it must be based on the ability to trace the root cause of problems to where they have occurred in the system in a way that only
    talks about the possible places that error has occurred.

    The call stack is not sufficient, in part because of the inclusion of the internal machinery calls, like junctions and cell methods.

    it is only the tractors provided by the Module that should be a source of runtime error.

    there is potential for many kinds of problem to do with invalid specification or use of jungle primatives.

    The traceback must ignore the use of

*/

namespace Jungle {

    export namespace Debug {

        export function dumpToDepthF(maxdepth, indentSym="  "){

            let recur = function(depth, indentation, item){

                let outstr = "\n";

                if(Util.isPrimative(item) || depth <= 0){
                    outstr = String(item);
                }else if(item instanceof Array){
                    outstr = "[\n"
                    item.forEach((item)=>{outstr+=(indentation+recur(depth-1, indentation+indentSym, item)+'\n')});
                    outstr += "\n]"
                }else if(item instanceof Object){
                    outstr = "{\n"
                    for(let k in item){
                        outstr+=(indentation+indentSym+k+': '+recur(depth-1, indentation+indentSym, item[k])+'\n');
                    }
                    outstr += "\n"+indentation+"}";
                }

                return outstr;



            }

            return (x) => {
                //console.log("dump to depth", x)
                return recur(maxdepth, "", x)
            }
        }

        export class JungleError {
            constructor (public message, public fileName?, public lineNumber?) {
                var err = new Error();
                // if (err.stack) {
                //     // remove one stack level:
                //     if (typeof(Components) != 'undefined') {
                //         // Mozilla:
                //         this.stack = err.stack.substring(err.stack.indexOf('\n')+1);
                //     }
                //     else if (typeof(chrome) != 'undefined' || typeof(process) != 'undefined') {
                //         // Google Chrome/Node.js:
                //         this.stack = err.stack.replace(/\n[^\n]*/,'');
                //     }
                //     else {
                //         this.stack = err.stack;
                //     }
                // }
                // this.message    = message    === undefined ? err.message    : message;
                // this.fileName   = fileName   === undefined ? err.fileName   : fileName;
                // this.lineNumber = lineNumber === undefined ? err.lineNumber : lineNumber;
            }
        }

        export interface CrumbOptions {
            header:string;
            traceDepth:number;
            debug:boolean|string[];
            log:{log:any};
            format:(whatever)=>any;
            with:(whatever)=>any;
            at:(whatever)=>any;
            within:(whatever)=>any;
            as:(whatever)=>any;
        }

        export class Crumb {

            static defaultOptions:CrumbOptions = {
                header:"Crumb",
                traceDepth:-1,
                debug:false,
                log:undefined,
                format:(x)=>{return x},
                with:undefined,
                at:undefined,
                within:undefined,
                as:undefined,
            }

            static customOptions = {

            }

            options:CrumbOptions;
            previous:Crumb;

            position:any;
            location:any;
            data:any;
            situation:any;
            message:string;

            catchCallback:(crumb:Crumb)=>void;
            raised:boolean;

            constructor(public label:string){
                this.raised = false;

                if(label in Crumb.customOptions){
                    this.setOptions(Crumb.customOptions[label]);
                }else{
                    this.options = Crumb.defaultOptions;
                }
            }

            setOptions(optionObj){
                if(Crumb.defaultOptions.debug instanceof Array){
                    if (Crumb.defaultOptions.debug.indexOf(this.label) !== -1){
                        (Crumb.customOptions[this.label] = Crumb.customOptions[this.label]||{debug:true}).debug = true
                    }
                }

                this.options = Util.melder(
                    Crumb.defaultOptions,
                    optionObj
                )
            }

            /*
                create a new crumb that is the next from this one
            */
            drop(label:string):Crumb{
                let crumb = new Crumb(label);
                crumb.previous = this;
                return crumb;
            }

            /**
                Take a side road, being unsure if it will go okay but wanting to make sure we can find the
                crumbs again we call the callback with the first argument as a new crumb.
                the callback is responsible for decorating the crumb.

             */
            excursion(label, callback:(crumb)=>void){
                let catcher = this.drop(label)
                    .catch((crumback)=>{
                        this.raise(`
Excursion Failure: ${crumback.message}

While Attempting:
${crumback.describe()}
`); // set so when the crumb raises it comes back here(unless the catch is overridden again)
                    })

                try{
                    callback(catcher)
                }catch(e){
                    catcher.raise(e)
                }
            }

            /*
                describe the position,
                like what is being done at the present,
                not coordinates or temporal position,
            */
            at(position){
                if(this.options.debug){
                    this.position = (this.options.at || this.options.format)(position);

                    if(this.options.log !== undefined){
                        let logmsg = (`[${this.label}] at: ${this.position}`)
                        this.options.log.log(logmsg)
                    }
                }
                return this
            }

            /*
                describe the location, like what we are referred to by, who contains us, what are we within
            */
            in(location){
                if(this.options.debug){
                    this.location = (this.options.within|| this.options.format)(location);

                    if(this.options.log !== undefined){
                        let logmsg = (`[${this.label}] in: ${this.location}`)
                        this.options.log.log(logmsg)
                    }
                }
                return this
            }

            /**
                as in the subject did something as the situation was in such a state.
             */
            as(situation){
                if(this.options.debug){
                    this.situation = (this.options.as|| this.options.format)(situation);

                    if(this.options.log !== undefined){
                        let logmsg = (`[${this.label}] as: ${this.situation}`)
                        this.options.log.log(logmsg)
                    }
                }
                return this
            }

            /**
             * the data being passed through at the time.
             */
             with(data){
                 if(this.options.debug){
                     this.data = (this.options.with|| this.options.format)(data);

                     if(this.options.log !== undefined){
                         let logmsg = (`[${this.label}] with: ${this.data}`)
                         this.options.log.log(logmsg)
                     }
                 }
                 return this
             }

            dump(){
                return`
${this.message !== undefined?`Error: ${this.message}`:''}

Crumb Trail(most recent at top):
${this.traceback(this.options.traceDepth)}\
                `
            }

            describe(){
                return `\
* ${this.options.header}: ${this.label}\
${this.position !== undefined?`\n|    at: ${this.position}`:''}\
${this.location !== undefined?`\n|    within: ${this.location}`:''}\
`
            }

            traceback(depth=-1){
                if(this.previous !== undefined && (depth > 0 || depth === -1)){
                    return `
${this.describe()}
|
${this.previous.traceback(depth-1)}
                    `
                }else{
                    return this.describe()
                }
            }

            catch(callback){
                this.catchCallback = callback;
                return this;
            }

            /*
                raise the exception with the catch or throw the error up the stack
            */
            raise(error){
                if(this.catchCallback && !this.raised){
                    this.raised = true;
                    this.message = error;
                    this.catchCallback(this)
                }else{
                    this.message = error;
                    throw new JungleError(this.dump());
                }
            }

            deflect(exception){
                if(this.previous){
                    this.previous.raise(`
Deflected:
    from: ${this.label}
    message: ${exception}`
);
                }else{
                    this.raise(exception)
                }
            }



        }

    }

}
