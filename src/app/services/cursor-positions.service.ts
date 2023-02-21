import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursorPositionsService {
  isAtTheBottom(id: string) {
    if(this.set[id]){
      return true;
    }

    return this.set[id];
  }

  constructor() {
    this.set = {};
   }

  public set:{[chatId:string]:boolean};
}
