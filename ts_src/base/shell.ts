namespace Jungle {
    export namespace IO {

        export interface PortSpec{
            label:string;
            direction: Orientation;
        }

        /**
         * The basic shell should be built from a number of prot specs, every shell can have special input and dressing
         */
        export class BaseShell implements Shell{

            sinks:any;
            sources:any;

            ports:PortSpec[];
            base:IOComponent;

            constructor(base:IOComponent, ports:PortSpec[]){
                this.base = base;
                this.ports = ports;

                this.sinks = {'$':new Port('$')};
                this.sinks.$.addShell(this);

                this.sources = {'$': new Port('$')};
                this.sources.$.addShell(this);

                for(let portSpec of ports){

                    switch(portSpec.direction){
                        case Orientation.INPUT:{
                            this.sinks[portSpec.label] = new Port(portSpec.label);
                            this.sinks[portSpec.label].addShell(this); break;
                        }
                        case Orientation.OUTPUT:{
                            this.sources[portSpec.label] = new Port(portSpec.label);
                            this.sources[portSpec.label].addShell(this);break;
                        }
                    }
                }
            }

            invert():BaseShell{
                let inversion = new BaseShell(this.base, []);
                inversion.sinks = this.sources;
                inversion.sources = this.sinks;
                return inversion;
            }

            designate(designator:PortDesignator): Port[]{
                let scanDomain;

                //a hold for
                const designation:(Port)[]= [];

                switch(designator.direction){
                    case Orientation.NEUTRAL:{
                        return [];
                    }
                    case Orientation.INPUT:{
                        scanDomain = Util.flattenObject(this.sinks, 1); break;
                    }
                    case Orientation.OUTPUT:{
                        scanDomain = Util.flattenObject(this.sources, 1); break;
                    }
                    case Orientation.MIXED:{
                        scanDomain = Util.collapseValues(this.sources).concat(Util.collapseValues(this.sinks)) ; break;
                    }
                }

                for(let portlabel in scanDomain){
                    let port = scanDomain[portlabel];

                    if(port.designate(designator)){
                        designation.push(port)
                    }
                }

                return designation;
            }

            dress(designator:PortDesignator, coat:OutputCoat){

                designator.direction = Orientation.OUTPUT;
                let designation = this.designate(designator);
                for(let k in designation){
                    let outport = <ResolveOutputPort>designation[k];
                    outport.dress(coat);
                }
            }

            extractPorts():string[]{
                let extracted = this.ports.map(pspec =>{
                    return (pspec.direction==IO.Orientation.INPUT?'_':'')+pspec.label+(pspec.direction==IO.Orientation.OUTPUT?'_':'');
                });

                return extracted
            }


        }

    }
}
