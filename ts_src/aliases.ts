namespace Gentyl {

    /**
     * Crete a G-Node in a Generic way
     * @param:component
     */
    export function G(components:Object, form, state){
        return new GNode(components, form, state)
    }

    /**
     * Alias to create a functional G-node,
     */
    export function F(func, components, state){
        return new GNode(components, {r:func}, state)
    }

    /**
     * Create an input leaf node, defaulting to a passive point storage
     */
    export function I(label, target=[], inputFunction=Inventory.placeInput, resolveFunction=Inventory.pickupInput, state){
        var form = {t:target, r:resolveFunction};
        form['_'+label] = inputFunction;
        return new GNode({},<FormSpec>form, state || {_placed:null})
    }

    /**
     * Create an output leaf node, a node that passes
     */
    export function O(label, outputFunction){
        var form = {r:Inventory.retract};
        form[label+'_'] = outputFunction;
        return new GNode({},form,{})
    }

    export function R(reconstructionBundle){
        return new Reconstruction(reconstructionBundle)
    }

    export function T(type){
        return new Terminal(type)
    }

}
