

export interface CacheMode {

    isDone():boolean; //
    isBusy():boolean;

    depart(...arg:any[]):number
    backOK(ticket:number, value, ...arg:any[])
    backERR(ticket:number, err:any, ...arg:any[])

    getCached():any
}

export class BaseMode {

    raising:boolean;
    checkedTickets:boolean[];
    ticketNo:number;

    constructor(){
        this.checkedTickets  = [];
        this.ticketNo = 0;
        this.raising = true;
    }

    protected checkOut():number{
        let ticket = this.ticketNo++
        this.checkedTickets[ticket] = false;
        return ticket
    }

    protected checkIn(ticket:number){
        this.checkedTickets[ticket] = true
    }

    protected allIn():boolean{
        return this.checkedTickets.reduce((prev, current)=>{
            return prev && current
        }, true)
    }

    protected anyIn():boolean{
        return this.checkedTickets.reduce((prev, current)=>{
            return prev || current
        }, true)
    }

    backERR(ticket:number, err, ...args){
        if(this.raising){
            return err
        }
    }

    isBusy(){
        return this.checkedTickets.length > 0
    }

    isDone(){
        return this.allIn()
    }

    depart(...args):number {
        return this.checkOut()
    }
}

export class FirstMode extends BaseMode implements CacheMode{
    value:any
    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)

        if(this.value === undefined){
            this.value = value
        }
    }

    getCached(){
        return this.value
    }

}

export class SilentMode extends BaseMode implements CacheMode{

    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)
    }

    getCached(){
        return undefined
    }

}


export class LastMode extends BaseMode implements CacheMode{
    value:any
    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)
        this.value = value
    }


    getCached(){
        return this.value
    }
}


export class SingleMode extends BaseMode implements CacheMode{
    value:any
    special:number;

    depart(...args):number {
        let ticket = this.checkOut()

        if(args[0]){
            this.special = ticket
        }

        return ticket
    }

    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)

        if(ticket === this.special){
            this.value = value
        }
    }


    getCached(){
        return this.value
    }
}

export class RaceMode extends BaseMode implements CacheMode{
    value:any

    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)
        this.value = value
    }


    isDone(){
        return this.anyIn()
    }

    getCached(){
        return this.value
    }
}

export class AppendMode extends BaseMode implements CacheMode{
    returned:any

    constructor(){
        super()
        this.returned = []
    }

    depart(...args):number {
        let ticket = this.checkOut()


        return ticket
    }

    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)
        this.returned.push(value)
    }


    getCached(){
        return this.returned
    }
}


export class ObjectMode extends BaseMode implements CacheMode{
    returned:any

    constructor(){
        super()
        this.returned = {}
    }

    depart(...args):number {
        let ticket = this.checkOut()

        return ticket
    }

    backOK(ticket:number, value, ...args){
        this.checkIn(ticket)

        let derefs = args[0]||[]
        derefs = typeof derefs == "string"?[derefs]:derefs

        if(derefs.length === 0){
            this.returned = value
        }else{
            let tip = this.returned
            for(let i = 0; i<derefs.length ;i ++){
                let deref = derefs[i]
                tip = tip[deref] = tip[deref]||(i===derefs.length-1? value : {})
            }
        }
    }

    getCached(){
        return this.returned
    }
}
