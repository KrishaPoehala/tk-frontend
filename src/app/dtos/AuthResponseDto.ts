export interface AuthRepsonseDto{
    isAuthSuccessfull : boolean,
    errorMessages: string | null[],
    accessToken: string | null,
    refreshToken:string|null,
}