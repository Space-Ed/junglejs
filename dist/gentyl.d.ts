/// <reference path="../typings/index.d.ts" />
declare namespace Gentyl {
    namespace Util {
        function translator(node: any, translation: any): any;
        function melder(node1: any, node2: any, merge?: (a: any, b: any) => any, concatArrays?: boolean): any;
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
        ownProperties: any;
        propertyLayerMap: any;
        constructor(host: ResolutionNode, hostContext: any, mode: string);
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
         * add all the properties of the target layer to the ownPropertiesMap.
         */
        addInherentLayer(layerctx: ResolutionContext): void;
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
         * take
         */
        addSourceLayer(layer: ContextLayer): void;
    }
}
declare namespace Gentyl {
    class ResolutionNode {
        private resolver;
        private carrier;
        ctx: ResolutionContext;
        node: any;
        parent: ResolutionNode;
        depth: number;
        root: ResolutionNode;
        constructor(resolver: Function, components: Object, carrier?: (x: any) => any, mode?: string);
        private prepareComponent(component);
        getParent(toDepth?: number): ResolutionNode;
        getRoot(): ResolutionNode;
        private setParent(parentNode);
        private resolveArray(array, resolveArgs);
        private resolveObject(node, resolveArgs);
        private resolveNode(node, resolveArgs);
        private resolveUnderscore(resolver, resolveArgs);
        resolve(resolveArgs: any): any;
    }
    class BlankNode extends ResolutionNode {
        constructor(components: any);
    }
    function _(components: Object, resolver?: (x: any, a: any) => any, carrier?: (x: any) => any, mode?: string): ResolutionNode;
}
declare namespace Gentyl {
    function sA(components: any, resolveArgs: any): any;
}
