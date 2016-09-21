namespace Gentyl {

    /**
     * Crete a G-Node in a Generic way
     * @param:component
     */
    export function G(components:Object, form, state){
        return new ResolutionNode(components, form, state)
    }

    /**
     * Alias to create a functional G-node,
     */
    export function F(func, components, state){
        return new ResolutionNode(components, {f:func}, state)
    }

    /**
     * Create an input leaf node, defaulting to a passive point storage
     */
    export function I(label, target=[], inputFunction=Inventory.placeInput, resolveFunction=Inventory.pickupInput, state){
        return new ResolutionNode({},{i:inputFunction, t:target, il:label}, state || {_placed:null})
    }

    /**
     * Create an output leaf node, a node that passes
     */
    export function O(label, outputFunction){
        return new ResolutionNode({},{ol:label, o:outputFunction, f:Inventory.retract},{})
    }

    export function R(reconstructionBundle){
        return new Reconstruction(reconstructionBundle)
    }

}
