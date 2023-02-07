
export class RegisterUserDto{
    constructor(public firstName:string | null, public lastName:string | null, 
        public email:string | null,public password:string | null,public confirmPassword:string | null,
        public profilePhotoUrl:string | null)
    {}
    
}