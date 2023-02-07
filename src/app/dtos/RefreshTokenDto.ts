export class RefreshTokenDto{
    constructor(public accessToken:string, public refreshToken:string)
    {}
}