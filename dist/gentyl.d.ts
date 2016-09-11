/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    namespace Util {
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean): any;
        function isDeepReplica(node1: any, node2: any): boolean;
        function softAssoc(from: any, onto: any): void;
        function assoc(from: any, onto: any): void;
        function copyObject(object: any): {};
        function applyMixins(derivedCtor: any, baseCtors: any[]): void;
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
        /**
         * create the layers, at each stage looking up contexts relative to the host.
         *
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
         * get the actual source of the desired property. use to set/getItems,
         should be recursive with a base of either reaching a node without the key or which hold the key
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
declare namespace Gentyl {
    interface Form {
        f?: (obj, args?) => any;
        c?: (args?) => any;
        m?: string;
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
        carrier: (obj) => any;
        resolver: (obj) => any;
        ancestor: ResolutionNode;
        ctxmode: string;
        ctxcache: any;
        constructor(components: any, form?: Form, state?: any);
        /**
         * setup the state tree, recursively preparing the contexts
         */
        prepare(): ResolutionNode;
        private inductComponent(component);
        replicate(): ResolutionNode;
        getParent(toDepth?: number): ResolutionNode;
        getRoot(): ResolutionNode;
        private setParent(parentNode);
        private resolveArray(array, resolveArgs);
        private resolveObject(node, resolveArgs);
        private resolveNode(node, resolveArgs);
        private resolveUnderscore(resolver, resolveArgs);
        resolve(resolveArgs: any): any;
    }
    function g(components: Object, form: any, state: any): ResolutionNode;
}
declare namespace Gentyl {
    function sA(components: any, resolveArgs: any): any;
}
