namespace Jungle {

    export namespace IO {

        enum LINK_FILTERS {
            PROCEED, DECEED, ELSEWHERE, NONE
        }

        interface LinkIR {
            sourceCell:string;
            sinkCell:string;
            sourcePort:PortDesignator;
            sinkPort:PortDesignator;
            closeSource:boolean;
            closeSink:boolean;
            persistent:boolean;
            matching:boolean;
            propogation:LINK_FILTERS;
        }

        export class LinkIO extends BaseIO implements IOComponent {

            shell:BaseShell;
            specialGate:boolean;

            lining:Shell;
            linkmap:any;
            linker:(porta, portb)=>void;

            constructor(host:LinkCell, private spec:IOLinkSpec){
                super(host, spec);

                this.linkmap = {};
                this.linker = spec.linkFunciton;

            }

            enshell():Shell{
                this.shell = new BaseShell(this.spec.ports);
                this.lining = this.shell.invert();
                this.innerDress();
                this.applyLinks();
                return
            };

            /**
             * All sources available must be dressed with a link follower
             */
            innerDress(){
                for(let k in this.host.crown){
                    let v:BaseCell = this.host.crown[k];
                    let cellSources = v.io.shell.sources;
                    this.linkmap[k] = {};

                    for(let q in cellSources){
                        let source = cellSources[q];
                        this.linkmap[k][q] = [];
                        source.callback = this.follow.bind(this,k,source);
                    }
                }

                this.linkmap['_'] = {}
                for(let q in this.lining.sources){
                    let source =  this.lining.sources[q];
                    this.linkmap["_"][q] = [];
                    source.callback = this.follow.bind(this, '_', source);
                }
            }

            applyLinks(){
                for(let link of this.spec.links){
                    var linkir = this.parseLink(link);
                    this.interpretLink(linkir);
                }
            }

            private parseLink(link):LinkIR{
                let m = link.match(/(?:(\w+).)?(\w+)(\|?)(<?)([\+\-\!]?)([=\-])(>{1,2})(\|?)(?:(\w+).)?(\w+)/);
                if(!m){throw new Error(`Unable to parse link description, expression ${link} did not match regex`)};
                let [match, srcCell, srcPort, srcClose, viceVersa, filter, matching, persistent, snkClose, snkCell, snkPort] = m;

                let srcDesig =  {direction:Orientation.OUTPUT, type: (srcPort == '*')?DesignationTypes.ALL:DesignationTypes.MATCH, data:srcPort}
                let snkDesig =  {direction:Orientation.INPUT, type: (snkPort == '*')?DesignationTypes.ALL:DesignationTypes.MATCH, data:snkPort}


                return {
                    sourceCell:srcCell,
                    sourcePort:srcDesig,
                    sinkCell:snkCell,
                    sinkPort:snkDesig,
                    closeSource:false,
                    closeSink:false,
                    persistent:false,
                    matching:false,
                    propogation:LINK_FILTERS.NONE
                }

            }

            private interpretLink(linkspec:LinkIR){
                //console.log("Link interpret ", linkspec)

                let sourceShells  = {};
                let sourceLabels = [];
                if(linkspec.sourceCell === "*"){
                    sourceShells = Util.mapObject(this.host.crown, function(k, src){sourceLabels.push(k); return src.io.shell});
                }else if (linkspec.sourceCell in this.host.crown){
                    sourceShells[linkspec.sourceCell] = this.host.crown[linkspec.sourceCell].io.shell; sourceLabels = [linkspec.sourceCell];
                }else if(linkspec.sourceCell === '_'){
                    sourceShells['_'] = (<LinkIO>this.host.io).lining; sourceLabels = ['_'];
                }

                let sinkShells = [];
                if(linkspec.sinkCell === "*"){
                    sinkShells = Util.flattenObject(this.host.crown, 1).map(function(x){return x.io.shell});
                }else if(linkspec.sinkCell in this.host.crown){
                    sinkShells = [this.host.crown[linkspec.sinkCell].io.shell];
                }else if(linkspec.sinkCell === '_'){
                    sinkShells = [(<LinkIO>this.host.io).lining];
                }

                for(let sourceLb of sourceLabels){
                    for(let sinkSh of sinkShells){
                        let sourcePorts = (<BaseShell>sourceShells[sourceLb]).designate(linkspec.sourcePort);
                        //console.log("sourceP",sourcePorts)
                        for(let sourceP of sourcePorts){
                            let sinkPorts = (<BaseShell>sinkSh).designate(linkspec.sinkPort);
                            //console.log("sinkP",sinkPorts)
                            for(let sinkP of sinkPorts){
                                this.forgeLink(sourceLb, sourceP, sinkP);
                            }
                        }
                    }
                }
            }

            private forgeLink(sourceCell:string, sourcePort:Port, sink:Port, close=false){
                this.linkmap[sourceCell][sourcePort.label].push(sink)
            }

            follow(sourceCell:string, source:Port, throughput){
                var targeted = this.linkmap[sourceCell][source.label]
                for(let sink of targeted){
                    //console.log(`Throughput of ${throughput} from source ${source.label} to ${sink.label}`)
                    //TODO: functional throughput
                    sink.handle(throughput);
                }
            }

            prepare(parg){

            };

            extract(){

            }
        }



    }

}
