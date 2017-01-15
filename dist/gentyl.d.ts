/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    function G(components: Object, form: any): ResolutionNode;
    function F(func: any, components: any): ResolutionNode;
    function R(reconstructionBundle: any): Reconstruction;
    function T(type: any): Terminal;
}
declare namespace Gentyl {
    namespace Actions {
        class Component {
            private host;
            constructor(host: BaseNode);
            add(keyOrVal: any, val: any): void;
        }
    }
}
declare namespace Gentyl {
    enum ASSOCMODE {
        INHERIT = 0,
        SHARE = 1,
        TRACK = 2,
    }
    interface ContextLayer {
        source: GContext;
        mode: ASSOCMODE;
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
        closed: boolean;
        constructor(host: BaseNode, contextspec: any);
        borrowExposed(): this;
        restoreExposed(returned: any): void;
        prepare(): void;
        extract(): any;
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
declare namespace Gentyl {
    class BaseNode {
        crown: any;
        ctx: GContext;
        form: GForm;
        io: IO.IOComponent;
        act: Actions.Component;
        parent: BaseNode;
        depth: number;
        isRoot: boolean;
        root: BaseNode;
        prepared: boolean;
        ancestor: BaseNode;
        isAncestor: boolean;
        constructor(components: any, form?: FormSpec);
        protected constructForm(): GForm;
        protected constructIO(iospec: any): IO.IOComponent;
        protected constructContext(contextspec: any): GContext;
        protected constructActions(): Actions.Component;
        protected constructCore(crown: any, form: any): BaseNode;
        inductComponent(component: any): any;
        prepare(prepargs?: any): BaseNode;
        protected prepareChild(prepargs: any, child: any, k: any): BaseNode;
        protected setParent(parentNode: BaseNode, dereferent: string | number): void;
        replicate(): BaseNode;
        getParent(toDepth?: number): BaseNode;
        getRoot(): BaseNode;
        getNominal(label: any): BaseNode;
        terminalScan(recursive?: boolean, collection?: any[], locale?: any): any[];
        checkComplete(recursive?: boolean): boolean;
        bundle(): Bundle;
        enshell(callback?: any, context_factory?: any): this;
        resolve(arg: any): any;
    }
}
declare namespace Gentyl {
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
    interface FormSpec {
        r?: (obj, args?) => any;
        c?: (args?) => any;
        s?: (keys, arg?) => any;
        p?: (arg) => void;
        x?: string;
    }
    class GForm {
        private host;
        static RFormProps: string[];
        carrier: (arg) => any;
        resolver: (obj, arg) => any;
        selector: (keys, arg) => any;
        preparator: (arg) => void;
        depreparator: (arg) => void;
        constructor(host: BaseNode);
        parse(formObj: FormSpec): {
            iospec: any;
            contextspec: {
                properties: any;
                declaration: string;
            };
        };
        consolidate(io: IO.IOComponent, ctx: GContext): FormSpec;
    }
}
declare namespace Gentyl {
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
        }
        interface IOComponent {
            shell: Shell;
            enshell: (callback?, context?) => Shell;
            prepare: (parg) => void;
            extract: () => any;
        }
        class Port {
            label: any;
            callbackContext: any;
            callback: (output, ...args) => any;
            shells: Shell[];
            constructor(label: any);
            addShell(shell: Shell): void;
            handle(input: any): void;
        }
        class BaseIO implements IOComponent {
            specialGate: boolean;
            shell: Shell;
            constructor();
            prepare(): void;
            enshell(): Shell;
            extract(): any;
        }
    }
}
declare namespace Gentyl.Inv {
}
declare namespace Gentyl.Inv {
    function retract(obj: any, arg: any): any;
}
declare namespace Gentyl.Inv {
    function selectNone(): any[];
}
declare namespace Gentyl.Inv {
    function pass(x: any): any;
    function abstain(x: any): void;
}
declare module Gentyl {
}
declare namespace Gentyl {
    namespace IO {
        class LinkIO implements IOComponent {
            shell: Shell;
            specialGate: boolean;
            constructor();
            enshell(callback: any, context: any): Shell;
            prepare(parg: any): void;
            extract(): void;
        }
    }
}
declare namespace Gentyl {
    interface FormRef {
        f: string;
        c: string;
        m: string;
    }
    interface FunctionCache {
        storeFunction(func: Function): string;
        recoverFunction(id: string): Function;
    }
    interface Bundle {
        node: any;
        form: FormRef;
        state: any;
    }
    function isBundle(object: any): boolean;
    function deformulate(fromNode: BaseNode): any;
    function reformulate(formRef: FormRef): FormSpec;
    class Reconstruction extends BaseNode {
        constructor(bundle: Bundle);
    }
}
declare namespace Gentyl {
    class ResolutionNode extends BaseNode {
        io: IO.ResolveIO;
        protected constructForm(): any;
        protected constructIO(iospec: any): IO.ResolveIO;
        protected constructCore(crown: any, form: any): ResolutionNode;
        private resolveArray(array, resolveArgs, selection);
        private resolveObject(node, resolveArgs, selection);
        private resolveNode(node, resolveArgs, selection);
        resolve(resolveArgs: any): any;
    }
}
declare namespace Gentyl {
    namespace IO {
        interface Hook {
            host: ResolutionNode;
            label: string;
            tractor: Function;
            orientation: Orientation;
            eager: boolean;
        }
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
            constructor(label: string, outputCallback: any, outputContext: any);
            prepareContext(outputContext: any): any;
        }
        class ResolveIO implements IOComponent {
            host: ResolutionNode;
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
            constructor(host: ResolutionNode, iospec: any);
            prepare(): void;
            extract(): {};
            initialiseHooks(hooks: Hook[], specialIn: Hook, specialOut: Hook): void;
            addHook(hook: Hook): void;
            enshell(opcallback: any, opcontext?: any): HookShell;
            reorient(): void;
            collect(opcallback: any, opcontext?: any): {
                hooks: Hook[];
                shells: Shell[];
            };
            dispatchResult(result: any): any;
        }
        class HookShell implements Shell {
            base: ResolveIO;
            inputHooks: any;
            outputHooks: any;
            sinks: any;
            sources: any;
            constructor(base: ResolveIO, midrantHooks: Hook[], subshells: Shell[], opcallback: any, opcontext?: any);
            addMidrantHook(hook: Hook): void;
            addShell(shell: Shell): void;
        }
    }
}
declare namespace Gentyl {
    class Terminal {
        private type;
        constructor(type: any);
        check(obj: any): boolean;
    }
}
declare namespace Gentyl {
    namespace Util {
        function identity(x: any): any;
        function weightedChoice(weights: number[]): number;
        function range(...args: any[]): any[];
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean): any;
        function deeplyEquals(node1: any, node2: any, allowIdentical?: boolean): boolean;
        function deeplyEqualsThrow(node1: any, node2: any, derefstack: any, seen: any, allowIdentical?: boolean): boolean;
        function isDeepReplica(node1: any, node2: any): void;
        function isDeepReplicaThrow(node1: any, node2: any, derefstack: any): void;
        function softAssoc(from: any, onto: any): void;
        function parassoc(from: any, onto: any): void;
        function assoc(from: any, onto: any): void;
        function deepCopy<T>(thing: T): T;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
        function objectArrayTranspose(objArr: any, key: string): void;
        function isPrimative(thing: any): boolean;
        function isVanillaObject(thing: any): boolean;
        function isVanillaArray(thing: any): boolean;
        function isTree(thing: any, stack?: any[]): any;
        function isVanillaTree(thing: any, stack?: any[]): any;
        function typeCaseSplitR(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any, initial?: any, reductor?: (a: any, b: any, k: any) => void) => any;
        function typeCaseSplitF(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
        function typeCaseSplitM(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => void;
        class AsyncGate {
            locks: {};
            constuctor(): void;
        }
    }
}
