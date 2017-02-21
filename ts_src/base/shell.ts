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

            base:IOComponent;

            constructor(ports:PortSpec[]){
                this.sinks = {};
                this.sources = {};

                for(let portSpec of ports){

                    switch(portSpec.direction){
                        case Orientation.INPUT:{
                            this.sinks[portSpec.label] = new Port(portSpec.label); break;
                        }
                        case Orientation.OUTPUT:{
                            this.sources[portSpec.label] = new Port(portSpec.label); break;
                        }
                    }
                }
            }

            invert():BaseShell{
                let inversion = new BaseShell([]);
                inversion.sinks = this.sources;
                inversion.sources = this.sinks;
                return inversion;
            }

            designate(designator:PortDesignator): (ResolveInputPort|ResolveOutputPort)[]{
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

        }

    }
}
