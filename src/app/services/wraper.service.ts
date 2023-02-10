

export class Wrapper{
    constructor(public wrapped:any){

    }

    public static wrap(value:any){
        return new Wrapper(value);
    }
}