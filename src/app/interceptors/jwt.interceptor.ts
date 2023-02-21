import { JwtFacadeService } from '../services/jwt-facade.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private jwt:JwtFacadeService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(this._addJwtToken(request));
  }

  _addJwtToken(request:HttpRequest<any>){
    const token = this.jwt.getAccessToken();
    if(!token){
      return request;
    }

    return request.clone({
      setHeaders:{
        Authorization: `Bearer ${token}`
      }
    })
  }
}
