

export class Wrapper<T>{
    constructor(public value:T){

    }

    public static wrap<T>(value:T){
        return new Wrapper(value);
    }
}