namespace Gentyl {

    /**
     * Crete a G-Node in a Generic way
     * @param:component
     */
    export function G(components:Object, form){
        return new ResolutionNode(components, form)
    }

    /**
     * Alias to create a functional G-node,
     */
    export function F(func, components){
        return new ResolutionNode(components, {r:func})
    }

    export function R(reconstructionBundle){
        return new Reconstruction(reconstructionBundle)
    }

    export function T(type){
        return new Terminal(type)
    }

}
