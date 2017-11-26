const {j, J, Junction } = require('../build/jungle')

const readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class Client {
    constructor(name){
        this.name = name
    }

    requestAction(){
        let jt = new JT();
        jt.await((done, raise)=>{
            rl.question(`player : ${this.name} `, (answer)=>{
                done(answer)
            })
            
        })
        return jt
    }

    display(game){
        console.log("The game is as follows: " , game)
    }
}


J.define('player', j('cell',{
    head: {
        attach() {
            //connect to client
            this.client = new Client(this.body.name)
        }
    },

    sight: j('spring_out'),

    plays: j('spring_out'),


    turn: j('raw_op', {
        minor_arg1:'resolve',
        minor_return:'resolve',
        minor_op(arg, resolve){
            let play = () => {
                return this.earth.sight() //see what is happening 

                .then((gamestate) => {
                this.world.client.display(gamestate)

                return this.world.client.requestAction()

                    .then(act => {
                        this.earth.check(act)
                        .then(() => ( this.earth.plays(act)))
                        .catch(() => {
                            this.world.client.display("invalid move")
                            return play()
                        })
                    })
                })
            }
            play().then(resolve)
        }
    })
}))

J.define('deck', j({
    take: j('op', {
        resolve_in(){
        return this.earth.cards.pop()
        }
    }),

    cards: j(['A-s', 'J-d', 'k-c', '9-h'])
}))

J.define('stack', j({

    validate(card){},

    place: j('op', {
        resolve_in(card){
            let junc = new JT()
            let [ulfill, raise] = junc.hold()

            //detect action validity
            if (this.earth.validate()) {
                this.earth.top = card
            }else{
                raise('invalid move')
            }
        }
    }),
    
    see: j('op', {
        resolve_in(card){
            return this.earth.top
        }
    })
}))

J.define('game', j('cell',{
    inProgress: false,

    moves: j('media:direct', {
        law:'players.*:plays->stack:place'
    }),

    vision: j('media:compose', {
        law:'players.*:sight->stack#:see',
        symbols:['stack']
    }),
    
    round: j('spring_in'),

    turns: j('media:serial', {
        law: ':round->players:turn'
    }),

    results:j('spring_in'),

    start: j('op', {
        resolve_in(end){
            let round = () => {
                return this.earth.round()
                .then(round)
                .catch(gameover => {
                    this.world.results()
                    end()
                })
            }
            
            //start the turn loop
            round()
                
        }
    })
}))

let game = J.recover(j('game', {
    players:j({
        bob:j('player', {
            name:'bob'
        }),

        rex:j('player', {
            name:'rex'
        })
    })
}))

game.shell.contacts.start.put()
