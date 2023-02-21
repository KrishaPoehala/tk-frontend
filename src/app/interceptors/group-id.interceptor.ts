import { UserService } from 'src/app/services/user.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class GroupIdInterceptor implements HttpInterceptor {

  constructor(private userService:UserService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(this.addGroupId(request));
  }
  addGroupId(request: HttpRequest<unknown>): HttpRequest<any> {
    if(!this.userService.selectedChat){
      return request;
    }

    console.log('addding', this.userService.selectedChat.id);
    return request.clone({
      setHeaders:{
        groupId: this.userService.selectedChat.id.toString(),
      }
    })
  }
}
