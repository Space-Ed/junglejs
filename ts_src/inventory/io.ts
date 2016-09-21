namespace Gentyl. Inventory {

    export function placeInput(input){
        this._placed = input;
    }
    export function pickupInput(input){
        return this._placed = input;
    }

    export function retract(obj, arg){
        return arg
    }



}
