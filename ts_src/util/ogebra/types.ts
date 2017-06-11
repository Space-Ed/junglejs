

export type Reducer = (a:any, b:any, k?:string)=>any
export type Scanner = (obj)=>string[]
export type Terminator = (obj1:Object, obj2:Object, k:string)=>boolean
