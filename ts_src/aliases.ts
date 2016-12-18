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

    export function R(reconstructionBundle){
        return new Reconstruction(reconstructionBundle)
    }

    export function T(type){
        return new Terminal(type)
    }

}
