/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    function G(components: Object, form: any, state: any): GNode;
    function F(func: any, components: any, state: any): GNode;
    function I(label: any, target: any[], inputFunction: typeof Inventory.placeInput, resolveFunction: typeof Inventory.pickupInput, state: any): GNode;
    function O(label: any, outputFunction: any): GNode;
    function R(reconstructionBundle: any): Reconstruction;
    function T(type: any): Terminal;
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
        private mode;
        ownProperties: any;
        propertyLayerMap: any;
        closed: boolean;
        label: string;
        constructor(host: GNode, hostContext: any, mode: string);
        prepare(): void;
        extract(): any;
        parseMode(modestr: string): ContextLayer[];
        addOwnProperty(name: string, defaultValue: any): void;
        setItem(key: any, data: any): void;
        getItem(key: any): any;
        getItemSource(key: any): GContext;
        addInherentLayer(layerctx: GContext): void;
        addSourceLayer(layer: ContextLayer): void;
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
    }
}
declare namespace Gentyl {
    class GNode {
        ctx: GContext;
        crown: any;
        parent: GNode;
        depth: number;
        derefChain: (string | number)[];
        isRoot: boolean;
        root: GNode;
        prepared: boolean;
        form: GForm;
        io: IO.Component;
        ancestor: GNode;
        isAncestor: boolean;
        constructor(components: any, form?: FormSpec, state?: any);
        private inductComponent(component);
        prepare(prepargs?: any): GNode;
        private prepareChild(prepargs, child);
        replicate(): GNode;
        bundle(): Bundle;
        getParent(toDepth?: number): GNode;
        getRoot(): GNode;
        getNominal(label: any): GNode;
        private setParent(parentNode);
        private resolveArray(array, resolveArgs, selection);
        private resolveObject(node, resolveArgs, selection);
        terminalScan(recursive?: boolean, collection?: any[], locale?: any): any[];
        checkComplete(recursive?: boolean): boolean;
        add(keyOrVal: any, val: any): void;
        seal(typespec: any): void;
        private resolveNode(node, resolveArgs, selection);
        resolve(resolveArgs: any): any;
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
        m?: string;
    }
    class GForm {
        private host;
        ctxmode: string;
        carrier: (arg) => any;
        resolver: (obj, arg) => any;
        selector: (keys, arg) => any;
        preparator: (arg) => void;
        depreparator: (arg) => void;
        constructor(host: GNode);
        parse(formObj: FormSpec): {
            hooks: IO.Hook[];
            context: any;
            specialIn: IO.Hook;
            specialOut: IO.Hook;
        };
        extract(): FormSpec;
    }
}
declare namespace Gentyl.Inventory {
    function placeInput(input: any): void;
    function pickupInput(obj: any, arg: any): any;
    function retract(obj: any, arg: any): any;
}
declare namespace Gentyl.Inventory {
    function selectNone(): any[];
}
declare namespace Gentyl {
    namespace IO {
        const HALT: {};
        enum Orientation {
            INPUT = 0,
            OUTPUT = 1,
            NEUTRAL = 2,
            MIXED = 3,
        }
        interface Hook {
            host: GNode;
            label: string;
            tractor: Function;
            orientation: Orientation;
            eager: boolean;
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
        class ResolveInputPort extends Port {
            shells: HookShell[];
            constructor(label: any, ...shells: HookShell[]);
            handleInput(input: any): void;
        }
        class SpecialInputPort extends ResolveInputPort {
            private base;
            constructor(base: Component);
            handleInput(input: any): void;
        }
        class ResolveOutputPort extends Port {
            constructor(label: string, outputCallback: any, outputContext: any);
            prepareContext(outputContext: any): any;
        }
        class Component {
            host: GNode;
            hooks: Hook[];
            orientation: Orientation;
            isShellBase: boolean;
            base: Component;
            specialInput: Hook;
            specialOutput: Hook;
            specialGate: boolean;
            inputs: any;
            outputs: any;
            inputHooks: any;
            outputHooks: any;
            shell: HookShell;
            constructor(host: GNode, initHooks: Hook[], specialIn: Hook, specialOut: Hook);
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
        interface Shell {
            sinks: any;
            sources: any;
        }
        class HookShell implements Shell {
            base: Component;
            inputHooks: any;
            outputHooks: any;
            sinks: any;
            sources: any;
            constructor(base: Component, midrantHooks: Hook[], subshells: Shell[], opcallback: any, opcontext?: any);
            addMidrantHook(hook: Hook): void;
            addShell(shell: Shell): void;
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
    function deformulate(fromNode: GNode): any;
    function reformulate(formRef: FormRef): FormSpec;
    class Reconstruction extends GNode {
        constructor(bundle: Bundle);
    }
}
declare namespace Gentyl {
    class Terminal {
        private type;
        constructor(type: any);
        check(obj: any): boolean;
    }
}
