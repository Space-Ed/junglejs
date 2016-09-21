/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    namespace Util {
        function identity(x: any): any;
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
        function copyObject(object: any): {};
        function deepCopy(thing: any): any;
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
        function typeCaseSplitF(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
        function typeCaseSplitM(objectOrAllFunction: any, arrayFunc?: any, primativeFunc?: any): (inThing: any) => any;
    }
}
declare namespace Gentyl {
    enum ASSOCMODE {
        INHERIT = 0,
        SHARE = 1,
        TRACK = 2,
    }
    interface ContextLayer {
        source: ResolutionContext;
        mode: ASSOCMODE;
    }
    /**
     * The state manager for a resolution node. Handles the association of contexts and modification therin
     */
    class ResolutionContext {
        private host;
        private mode;
        ownProperties: any;
        propertyLayerMap: any;
        closed: boolean;
        constructor(host: ResolutionNode, hostContext: any, mode: string);
        prepare(): void;
        extract(): any;
        /**
         * create the layers, at each stage looking up contexts relative to the host.
         */
        parseMode(modestr: string): ContextLayer[];
        /**
         *
         */
        addOwnProperty(name: string, defaultValue: any): void;
        /**
         * Access the property-source map and appropriately adjust the value.
         If the context holds this property(the property source maps to this) then set the value of the property.
         If the property is tracked then throw a Unable to modify error
         If the property is not in the property layer map throw an unavailable property error
         */
        setItem(key: any, data: any): void;
        getItem(key: any): any;
        /**
         * get the actual source of the desired property. use to set/getItems
         */
        getItemSource(key: any): ResolutionContext;
        /**
         * add all the properties of the target layer to the ownPropertiesMap.
         */
        addInherentLayer(layerctx: ResolutionContext): void;
        /**
         * add a context source layer so that the properties of that layer are accessible in this context.
         */
        addSourceLayer(layer: ContextLayer): void;
    }
}
declare var signals: SignalWrapper;
declare namespace Gentyl {
    interface Form {
        f?: (obj, args?) => any;
        c?: (args?) => any;
        s?: (keys, arg?) => any;
        p?: (arg) => void;
        m?: string;
        i?: (arg) => any;
        o?: (arg) => any;
        il?: string;
        ol?: string;
        t?: any;
    }
    interface SignalShell {
        ins: any;
        outs: any;
    }
    class ResolutionNode {
        ctx: ResolutionContext;
        node: any;
        parent: ResolutionNode;
        depth: number;
        isRoot: boolean;
        root: ResolutionNode;
        prepared: boolean;
        functional: boolean;
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
        inputNodes: any;
        outputNodes: any;
        signalShell: SignalShell;
        targeted: boolean;
        ancestor: ResolutionNode;
        isAncestor: boolean;
        constructor(components?: any, form?: Form, state?: any);
        /**
         * setup the state tree, recursively preparing the contexts
         */
        prepare(prepargs?: any): ResolutionNode;
        private prepareIO();
        private prepareChild(child);
        replicate(prepargs?: any): ResolutionNode;
        bundle(): Bundle;
        getTargets(input: any, root: any): {};
        shell(): SignalShell;
        private inductComponent(component);
        getParent(toDepth?: number): ResolutionNode;
        getRoot(): ResolutionNode;
        private setParent(parentNode);
        private resolveArray(array, resolveArgs);
        private resolveObject(node, resolveArgs);
        private resolveNode(node, resolveArgs);
        private resolveUnderscore(resolver, resolveArgs);
        resolve(resolveArgs: any): any;
    }
}
declare var uuid: any;
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
    /**
     * build a form ref object for the bundle by storing the function externally
     * and only storing in the bundle a uuid or function name;
     */
    function deformulate(fromNode: ResolutionNode): any;
    /**
    * rebuild the form object by recovering the stored function from the cache using the uuids and labels.
     */
    function reformulate(formRef: FormRef): Form;
    class Reconstruction extends ResolutionNode {
        constructor(bundle: Bundle);
    }
}
declare namespace Gentyl {
    function sA(components: any, resolveArgs: any): any;
}
declare namespace Gentyl.Inventory {
    function placeInput(input: any): void;
    function pickupInput(input: any): any;
    function retract(obj: any, arg: any): any;
}
declare namespace Gentyl.Inventory {
    function selectNone(): any[];
}
declare namespace Gentyl {
    /**
     * Crete a G-Node in a Generic way
     * @param:component
     */
    function G(components: Object, form: any, state: any): ResolutionNode;
    /**
     * Alias to create a functional G-node,
     */
    function F(func: any, components: any, state: any): ResolutionNode;
    /**
     * Create an input leaf node, defaulting to a passive point storage
     */
    function I(label: any, target: any[], inputFunction: typeof Inventory.placeInput, resolveFunction: typeof Inventory.pickupInput, state: any): ResolutionNode;
    /**
     * Create an output leaf node, a node that passes
     */
    function O(label: any, outputFunction: any): ResolutionNode;
    function R(reconstructionBundle: any): Reconstruction;
}
