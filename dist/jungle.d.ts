/// <reference path="../typings/index.d.ts" />
declare namespace Jungle {
    function G(components: Object, form: any): ResolutionCell;
    function F(func: any, components: any): ResolutionCell;
    function T(type: any): Terminal;
    function L(crown: any, form: any): LinkCell;
}
declare namespace Jungle {
    namespace Actions {
        class Component {
            private host;
            constructor(host: BaseCell);
            add(keyOrVal: any, val: any): void;
        }
    }
}
declare namespace Jungle {
    enum ASSOCMODE {
        INHERIT = 0,
        SHARE = 1,
        TRACK = 2,
    }
    interface ContextSpec {
        properties: PropertySpec[];
        declaration: string;
    }
    interface ContextLayer {
        source: GContext;
        mode: ASSOCMODE;
    }
    interface PropertySpec {
        type: CTXPropertyTypes;
        key: any;
        value: any;
        reference?: any;
        original?: any;
    }
    enum CTXPropertyTypes {
        NORMAL = 0,
        BOUND = 1,
        HOOK = 2,
    }
    class GContext {
        private host;
        label: string;
        nominal: boolean;
        declaration: string;
        path: (string | number)[];
        exposed: any;
        internalProperties: any;
        propertyLayerMap: any;
        activePropertyRegister: any;
        closed: boolean;
        originals: any;
        cache: any;
        constructor(host: BaseCell, contextspec: ContextSpec);
        addInternalProperty(spec: PropertySpec): void;
        addHookedProperty(spec: PropertySpec): void;
        addThroughProperty(spec: PropertySpec): void;
        addInputProperty(spec: PropertySpec): void;
        addOutputProperty(spec: any): void;
        prepare(): void;
        extract(): {};
        parseMode(modestr: string): ContextLayer[];
        addExposedProperty(name: string, defaultValue: any): void;
        removeExposedProperty(name: string): void;
        setItem(key: any, data: any): void;
        getItem(key: any): any;
        getItemSource(key: any): GContext;
        addInherentLayer(layerctx: GContext): void;
        addSourceLayer(layer: ContextLayer): void;
    }
}
declare namespace Jungle {
    class BaseCell {
        kind: string;
        crown: any;
        ctx: GContext;
        form: BaseForm;
        io: IO.IOComponent;
        act: Actions.Component;
        parent: BaseCell;
        depth: number;
        isRoot: boolean;
        root: BaseCell;
        prepared: boolean;
        ancestor: BaseCell;
        isAncestor: boolean;
        junction: Util.Junction;
        inp: any;
        out: any;
        constructor(components: any, form?: FormSpec);
        protected constructForm(): BaseForm;
        protected constructIO(iospec: any): IO.IOComponent;
        protected constructContext(contextspec: any): GContext;
        protected constructActions(): Actions.Component;
        protected constructCore(crown: any, form: any): BaseCell;
        inductComponent(component: any): any;
        prepare(prepargs?: any): BaseCell;
        completePrepare(): void;
        protected prepareChild(prepargs: any, handle: any, child: any, k: any): void;
        protected setParent(parentCell: BaseCell, dereferent: string | number): void;
        replicate(): BaseCell;
        getParent(toDepth?: number): BaseCell;
        getRoot(): BaseCell;
        getNominal(label: any): BaseCell;
        terminalScan(recursive?: boolean, collection?: any[], locale?: any): any[];
        checkComplete(recursive?: boolean): boolean;
        bundle(): Bundle;
        enshell(): this;
        resolve(arg: any): any;
        X(crown: any, form: any): any;
    }
}
declare namespace Jungle {
    interface FormSpec {
        r?: (obj, args?) => any;
        c?: (args?) => any;
        p?: (arg) => void;
        d?: (arg) => void;
        x?: string;
        link?: string[];
        port?: string[];
        lf?: (porta, portb) => any;
        dl?: (porta, portb) => any;
    }
    interface FormResult {
        iospec?: any;
        contextspec?: ContextSpec;
    }
    class BaseForm {
        host: BaseCell;
        preparator: (arg) => void;
        depreparator: (arg) => void;
        constructor(host: BaseCell);
        parse(formObj: FormSpec): {
            iospec: any;
            contextspec: {
                properties: any;
                declaration: string;
            };
        };
        parsePorts(portNames: string[]): IO.PortSpec[];
        extract(): {
            p: (arg: any) => void;
            d: (arg: any) => void;
        };
        consolidate(io: IO.IOComponent, ctx: GContext): FormSpec;
    }
}
declare namespace Jungle {
    namespace IO {
        const HALT: {};
        function halting(arg: any): {};
        function passing(arg: any): any;
        function defined(arg: any): any;
        function always(arg: any): boolean;
        function nothing(arg: any): any;
        function host(arg: any): any;
        enum Orientation {
            INPUT = 0,
            OUTPUT = 1,
            NEUTRAL = 2,
            MIXED = 3,
        }
        interface Shell {
            sinks: {
                $: Port;
            };
            sources: {
                $: Port;
            };
            base: IOComponent;
            designate: (designator: PortDesignator) => Port[];
            dress: (designator: PortDesignator, coat: OutputCoat) => void;
            invert: () => Shell;
        }
        interface IOComponent {
            shell: Shell;
            host: BaseCell;
            enshell: () => Shell;
            dress: (designator: string, coat: OutputCoat) => void;
            extract: () => any;
        }
        enum DesignationTypes {
            ALL = 0,
            MATCH = 1,
            REGEX = 2,
            FUNC = 3,
        }
        interface PortDesignator {
            direction: Orientation;
            type: DesignationTypes;
            data: any;
        }
        interface OutputCoat {
            context: Object | ((ResolveOutputPort) => Object);
            callback: (output: any) => any;
        }
        class BaseIO implements IOComponent {
            host: BaseCell;
            specialGate: boolean;
            shell: Shell;
            ports: PortSpec[];
            constructor(host: BaseCell, iospec: any);
            dress(designation: any, coat: OutputCoat): void;
            enshell(): Shell;
            extract(): any;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class Port {
            label: any;
            callbackContext: any;
            callback: any;
            shells: Shell[];
            constructor(label: any);
            addShell(shell: any): void;
            hostctx(): any;
            designate(designator: PortDesignator): boolean;
            dress(coat: OutputCoat): void;
            prepareCallback(callback: any): void;
            prepareContext(outputContext: any): void;
            handle(input: any): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        interface PortSpec {
            label: string;
            direction: Orientation;
        }
        class BaseShell implements Shell {
            sinks: any;
            sources: any;
            ports: PortSpec[];
            base: IOComponent;
            constructor(base: IOComponent, ports: PortSpec[]);
            invert(): BaseShell;
            designate(designator: PortDesignator): Port[];
            dress(designator: PortDesignator, coat: OutputCoat): void;
            extractPorts(): string[];
        }
    }
}
declare namespace Jungle.Inv {
}
declare namespace Jungle.Inv {
    function retract(obj: any, arg: any): any;
}
declare namespace Jungle.Inv {
    function selectNone(): any[];
}
declare namespace Jungle.Inv {
    function pass(x: any): any;
    function abstain(x: any): void;
}
declare module Jungle {
    class LinkCell extends BaseCell {
        kind: string;
        constructor(crown: any, formspec: any);
        constructIO(iospec: any): IO.IOComponent;
        constructForm(): LinkForm;
        protected prepareChild(prepargs: any, handle: any, child: any, k: any): void;
        completePrepare(): void;
        resolve(resarg: any): void;
    }
}
declare namespace Jungle {
    interface IOLinkSpec {
        ports: IO.PortSpec[];
        linkFunciton: (a, b) => void;
        links: string[];
    }
    class LinkForm extends BaseForm {
        parse(formObj: FormSpec): {
            iospec: IOLinkSpec;
            contextspec: ContextSpec;
        };
    }
}
declare namespace Jungle {
    namespace IO {
        class LinkIO extends BaseIO {
            shell: BaseShell;
            specialGate: boolean;
            lining: Shell;
            linkmap: any;
            closed: {
                sinks: string[];
                sources: string[];
            };
            linker: (porta, portb) => void;
            links: string[];
            emmissionGate: Util.Junction;
            ports: PortSpec[];
            constructor(host: LinkCell, spec: IOLinkSpec);
            enshell(): Shell;
            innerDress(): void;
            applyLinks(): void;
            private parseLink(link);
            private interpretLink(linkspec);
            private checkLink(linkspec, sourceCellLabel, sinkCellLabel, sourceP, sinkP);
            private filterCheck(sourceLabel, sinkLabel, linkspec);
            private forgeLink(linkspec, sourceCell, sinkCell, sourcePort, sinkPort);
            follow(sourceCell: string, source: Port, throughput: any): void;
            prepare(parg: any): void;
            extract(): {
                port: string[];
                link: string[];
                lf: (porta: any, portb: any) => void;
            };
        }
    }
}
declare namespace Jungle {
    interface FunctionCache {
        storeFunction(func: Function): string;
        recoverFunction(id: string): Function;
    }
    function deformulate(fromCell: BaseCell): any;
    function reformulate(formRef: any): FormSpec;
    interface Bundle {
        core: string;
        crown: any;
        form: any;
    }
    function isBundle(object: any): boolean;
    function R(bundle: Bundle): any;
}
declare namespace Jungle {
    class ResolutionCell extends BaseCell {
        kind: string;
        io: IO.ResolveIO;
        form: GForm;
        resolveCache: {
            args: any;
            carried: any;
            selection: any;
            crowned: any;
            reduced: any;
        };
        protected constructForm(): GForm;
        protected constructIO(iospec: any): IO.ResolveIO;
        protected constructCore(crown: any, form: any): ResolutionCell;
        private resolveDenizen(handle, args, denizen, reference);
        private resolveCell(handle, node, carriedArgs, selection);
        resolve(resolveArgs: any): any;
        resolveCarryThen(results: any, handle: any): any;
        resolveCrownThen(results: any, handle: any): any;
        resolveReduceThen(results: any, handle: any): any;
        resolveCompleteThen(results: any, handle: any): any;
    }
}
declare namespace Jungle {
    enum LabelTypes {
        PASSIVE = 0,
        TRIG = 1,
        ENTRIG = 2,
        GATE = 3,
        GATER = 4,
        TRIGATE = 5,
        TRIGATER = 6,
        ENTRIGATE = 7,
        ENTRIGATER = 8,
    }
    class GForm extends BaseForm {
        static RFormProps: string[];
        carrier: (arg) => any;
        resolver: (obj, arg) => any;
        constructor(host: ResolutionCell);
        parse(formObj: FormSpec): {
            iospec: any;
            contextspec: ContextSpec;
        };
        extract(): {
            r: (obj: any, arg: any) => any;
            c: (arg: any) => any;
            p: (arg: any) => void;
            d: (arg: any) => void;
        };
    }
}
declare namespace Jungle {
    namespace IO {
        interface Hook {
            host: ResolutionCell;
            label: string;
            tractor: Function;
            orientation: Orientation;
            eager: boolean;
            reactiveValue?: boolean;
        }
        class ResolveIO extends BaseIO implements IOComponent {
            hooks: Hook[];
            orientation: Orientation;
            isShellBase: boolean;
            base: ResolveIO;
            specialInput: Hook;
            specialOutput: Hook;
            specialGate: boolean;
            inputs: any;
            outputs: any;
            inputHooks: any;
            outputHooks: any;
            shell: HookShell;
            host: ResolutionCell;
            ports: PortSpec[];
            portShell: BaseShell;
            constructor(host: ResolutionCell, iospec: any);
            initialisePorts(ports: PortSpec[]): void;
            extract(): {};
            initialiseHooks(hooks: Hook[], specialIn: Hook, specialOut: Hook): void;
            addHook(hook: Hook): void;
            enshell(): HookShell;
            reorient(): void;
            collect(): {
                hooks: Hook[];
                shells: Shell[];
            };
            dispatchResult(result: any): any;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class ResolveInputPort extends Port {
            shells: HookShell[];
            constructor(label: any, ...shells: HookShell[]);
            handleInput(input: any): void;
        }
        class SpecialInputPort extends ResolveInputPort {
            private base;
            constructor(base: ResolveIO);
            handleInput(input: any): void;
        }
        class ResolveOutputPort extends Port {
            constructor(label: string);
            handle(input: any): void;
        }
    }
}
declare namespace Jungle {
    namespace IO {
        class HookShell extends BaseShell implements Shell {
            base: ResolveIO;
            inputHooks: any;
            outputHooks: any;
            sinks: any;
            sources: any;
            constructor(base: ResolveIO, midrantHooks: Hook[], subshells: Shell[]);
            addMidrantHook(hook: Hook): void;
            addShell(shell: Shell): void;
        }
    }
}
declare namespace Jungle {
    class Terminal {
        private type;
        constructor(type: any);
        check(obj: any): boolean;
    }
}
declare namespace Jungle {
    namespace Util {
        function identity(x: any): any;
        function weightedChoice(weights: number[]): number;
        function range(...args: any[]): any[];
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean, typeConstrain?: boolean): any;
        function deeplyEquals(node1: any, node2: any, allowIdentical?: boolean): boolean;
        function deeplyEqualsThrow(node1: any, node2: any, derefstack: any, seen: any, allowIdentical?: boolean): boolean;
        function isDeepReplica(node1: any, node2: any): void;
        function isDeepReplicaThrow(node1: any, node2: any): void;
        function softAssoc(from: any, onto: any): void;
        function parassoc(from: any, onto: any): void;
        function assoc(from: any, onto: any): void;
        function deepCopy<T>(thing: T): T;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
        function objectArrayTranspose(objArr: any, key: string): void;
        function flattenObject(obj: any, depth?: number, values?: any[]): any[];
        function mapObject(obj: any, func: (key, value) => any): {};
        function isPrimative(thing: any): boolean;
        function isVanillaObject(thing: any): boolean;
        function isVanillaArray(thing: any): boolean;
        function isTree(thing: any, stack?: any[]): any;
        function isVanillaTree(thing: any, stack?: any[]): any;
        function typeCaseSplitR(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any, initial?: any, reductor?: (a: any, b: any, k: any) => void) => any;
        function typeCaseSplitF(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
        function typeCaseSplitM(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => void;
        function collapseValues(obj: any): any[];
    }
}
declare namespace Jungle {
    namespace Util {
        class Junction {
            private resultNature;
            awaits: any;
            index: number;
            silentAwaits: boolean[];
            silentIndex: number;
            residue: any;
            leashed: any;
            error: {
                message: string;
                key: string | number;
            };
            catchCallback: any;
            thenCallback: any;
            future: Junction;
            fried: boolean;
            blocked: boolean;
            cleared: boolean;
            thenkey: boolean | string | number;
            constructor();
            private proceedThen();
            private unleash(propagated);
            private proceedCatch(error);
            private successor();
            private frontier();
            realize(): any;
            private isClean();
            isIdle(): boolean;
            private isReady();
            private isTampered();
            private isPresent();
            private hasFuture();
            private allDone();
            hold(returnkey?: any): ((result?: any) => any)[];
            _hold(returnkey?: any): ((result?: any) => any)[];
            await(act: (done: (returned: any) => Junction, raise: (message: string) => void) => any, label?: any): Junction;
            merge(upstream: any, holdstyle?: any): Junction;
            then(callback: (results: any, residue: any, handle: Junction) => void, thenkey?: any): Junction;
            catch(callback: Function): Junction;
        }
        class Gate {
            callback: any;
            context: any;
            private locks;
            private locki;
            private data;
            constructor(callback?: any, context?: any);
            lock(): (arg) => void;
            reset(): void;
            isClean(): boolean;
            allUnlocked(): boolean;
        }
    }
}
declare namespace Jungle {
    namespace Util {
        function B(crown?: {}, form?: any): Blender;
        class Blender {
            crown: any;
            static strictTypeReduce: boolean;
            static defaultReduce(a: any, b: any): any;
            static defaultMap(x: any): any;
            block: boolean;
            term: boolean;
            reducer: (a, b) => any;
            mapper: (a) => any;
            constructor(crown: any, form?: any);
            init(obj: any): Blender;
            initChurn(inner: any, k: any): any;
            dump(): any;
            blend(obj: any): this;
            private _blend(obj);
            merge(income: any): any;
        }
    }
}
