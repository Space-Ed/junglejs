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
        function deepCopy(thing: any): any;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
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
    interface IOShell {
        ins: any;
        outs: any;
    }
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
        inputNodes: any;
        outputNodes: any;
        ioShell: any;
        outputContext: any;
        outputCallback: string;
        targeted: boolean;
        ancestor: GNode;
        isAncestor: boolean;
        constructor(components: any, form?: FormSpec, state?: any);
        private inductComponent(component);
        prepare(prepargs?: any): GNode;
        private prepareChild(prepargs, child);
        private prepareIO();
        replicate(): GNode;
        bundle(): Bundle;
        getTargets(input: any, root: any): {};
        shell(): IOShell;
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
        private resolveUnderscore(resolver, resolveArgs);
        resolve(resolveArgs: any): any;
    }
}
declare namespace Gentyl {
    interface FormSpec {
        r?: (obj, args?) => any;
        c?: (args?) => any;
        s?: (keys, arg?) => any;
        p?: (arg) => void;
        m?: string;
        i?: (arg) => any;
        o?: (arg) => any;
        il?: string;
        ol?: string;
        t?: any;
        cl?: string;
    }
    class GForm {
        ctxmode: string;
        carrier: (arg) => any;
        resolver: (obj, arg) => any;
        selector: (keys, arg) => any;
        preparator: (arg) => void;
        targeting: any;
        inputLabel: string;
        outputLabel: string;
        inputFunction: (arg) => any;
        outputFunction: (arg) => any;
        contextLabel: string;
        constructor(formObj: FormSpec);
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
declare namespace Gentyl {
    namespace IO {
        var ioShellDefault: {
            setup: any;
            dispatch: any;
        };
        function setDefaultShell(shellConstructor: (label) => (output: any, label: string) => void | void): void;
        function setDefaultDispatchFunction(dispatchF: (output: any, label: string) => void): void;
        function setDefaultDispatchObject(object: Object | Function, method: string | ((output: any, label: string) => void)): void;
    }
}
