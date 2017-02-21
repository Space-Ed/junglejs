namespace Jungle {

    /**
     * Crete a G-Cell in a Generic way
     * @param:component
     */
    export function G(components:Object, form){
        return new ResolutionCell(components, form)
    }

    /**
     * Alias to create a functional G-node,
     */
    export function F(func, components){
        return new ResolutionCell(components, {r:func})
    }

    export function R(reconstructionBundle){
        return new Reconstruction(reconstructionBundle)
    }

    export function T(type){
        return new Terminal(type)
    }

    export function L(crown, form){
        return new LinkCell(crown, form)
    }

}
