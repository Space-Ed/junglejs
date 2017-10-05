

import {ObjectCell} from "../../../tertiary/cells/default";
import {Cell} from "../../../tertiary/cells/cell";
import * as A from '../../../aliases/all'

describe('defaults of objects', function(){

    describe('in isolation', function(){

        it('should construct and prime with exposed accessor',function(){

            let ObjectCell = new ObjectCell()

            ObjectCell.init({
                one:1,
                two:2
            })

            expect(ObjectCell.exposed.one).toBe(1)
        })



    })

    describe('as child', function(){

        it('should be implicitly accessible from parent state', function(){
            let aCell = new Cell()

            aCell.init({
                form:{
                    exposure:'public'
                },
                obj:{
                    form:{
                        exposure:'public'
                    },
                    one:"default primative"
                }
            })

            expect(aCell.subconstructs.obj instanceof ObjectCell).toBe(true, 'must be a default cell')
            expect(aCell.subconstructs.obj.exposed.one).toBe('default primative')
            expect(aCell.subconstructs.obj.exposure).toBe('public')

            expect((<any>aCell.state).outsourced.obj.exposed.one).toBe('default primative')
            expect(aCell.exposed.obj.one).toBe('default primative')

        })

    })

    describe('as parent', function(){

        it('should be able to have other cells within', function(){

            let defLep = new ObjectCell()

            defLep.init({
                subcell:{
                    basis:'cell',
                    laughs:'hahaha'
                },

                subdef:{
                    ok:'great'
                }
            });

            //default accessor of object cell
            expect(defLep.exposed.subdef.ok).toBe('great')


        })

    })


})
