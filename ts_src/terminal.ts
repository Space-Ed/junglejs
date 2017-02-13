

/*
    here we build the notion of a terminal type.

    the function of this is to serve as a placeholder for items that are required to be added before preparation.

    this thereby allows
    - raw replication to create a reusable pattern.
    - structure that is partially determined and completed through user input.
    - iteration through the incomplete components.

    typed terminals will have a requirement for a certain nominal Role to be filled,
    this role is either the name of the context
    or the name of a property set of which the type seal is assigned and checked
    these two may have alternate nomenclature.

    a terminal must only implement the appropriate checking of an object in order to meet condition for replacement.

*/

namespace Jungle {

    export class Terminal {

        constructor(private type){

        }

        check(obj){
            return true;
        }

    }


}
