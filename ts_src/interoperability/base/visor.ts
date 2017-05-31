

namespace Jungle {

    export namespace IO {

        export class Visor extends BasicDesignable{

            subranes:any;
            roles:any;

            constructor(private target:BasicDesignable, designator){
                super('subranes', 'roles')

            }

        }

    }

}
