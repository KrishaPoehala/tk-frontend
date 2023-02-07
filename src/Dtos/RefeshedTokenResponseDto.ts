export interface RefeshedTokenResponseDto{
    accessToken:string|null,
    refreshToken:string|null,
    errorMessage:string | null,
    isRefreshingSuccessfull:boolean,
}