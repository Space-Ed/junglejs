namespace Gentyl. Inventory {

    export function placeInput(input){
        this._placed = input;
    }
    export function pickupInput(obj, arg){
        return this._placed;
    }

    export function retract(obj, arg){
        return arg
    }



}
