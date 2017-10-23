
import {J, j, Cell, ObjectCell}   from '../../../jungle'

describe('defaults of objects', function(){

    describe('in isolation', function(){

        it('should construct and prime with exposed accessor',function(){

            let o1 = J.recover(j({
                one:1,
                two:2
            }))

            expect(o1.exposed.one).toBe(1)
        })

    })

    describe('as child', function(){

        it('should be implicitly accessible from parent state', function(){

            let aCell:Cell = <Cell>J.recover(j('cell', {
                obj:j({
                    one:"default primative"
                })
            }))

            expect(aCell.subconstructs.obj instanceof ObjectCell).toBe(true, 'must be a default cell')
            expect(aCell.subconstructs.obj.exposed.one).toBe('default primative')

            expect(aCell.exposed.obj.one).toBe('default primative')

        })

    })

    describe('as parent', function(){

        it('should be able to have other cells within', function(){

            let defLep = J.recover(j({
                subcell:j('cell',{
                    laughs:'hahaha'
                }),

                subdef:j({
                    ok:'great'
                })
            }))

            //default accessor of object cell
            expect(defLep.exposed.subdef.ok).toBe('great')


        })

    })


})
