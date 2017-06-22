

import {DefaultCell} from "../../../tertiary/cells/default";
import {Cell} from "../../../tertiary/cells/cell";
import * as A from '../../../aliases/all'
import {AccessHook} from "../../../tertiary/hooks/access";

describe('defaults of objects', function(){

    describe('in isolation', function(){


        it('should construct and prime with exposed accessor',function(){

            let defaultCell = new DefaultCell({
                form:{},
                one:1,
                two:2
            })

            defaultCell.prime(undefined)

            expect(defaultCell.lining.contacts.access).not.toBeUndefined()
            expect(defaultCell.shell.contacts.access).not.toBeUndefined()

            expect(defaultCell.nucleus.one).toBe(1)
        })



    })

    describe('as child', function(){

        it('should be implicitly accessible from parent state', function(){
            let aCell = new Cell({
                form:{},
                obj:{
                    form:{},
                    one:"default primative",
                    whut(x){
                        return "default strange function with "+this.one
                    }
                }
            })

            aCell.prime(undefined)

            expect(aCell.nucleus.obj.one).toBe('default primative')

        })

    })

    describe('as parent', function(){

        it('should be able to have other cells within', function(){

            let defLep = new DefaultCell({
                form:{},
                subcell: new Cell({
                    form:{},
                    laughs:'hahaha',
                    access:new AccessHook({
                        expose:true
                    })

                }),

                subdef:{
                    ok:'great'
                }
            })

            defLep.prime(undefined);

            //default accessor of object cell
            expect(defLep.nucleus.subdef.ok).toBe('great')

            //explicit access of subcell
           //console.log(defLep.nucleus)
            expect(defLep.subconstructs.subcell.shell.contacts.access).not.toBeUndefined()

            let accessed = defLep.nucleus['subcell:access'];
            expect(accessed.laughs).toBe('hahaha')


        })



    })

    describe('domain specialized default', function(){

    })

})
