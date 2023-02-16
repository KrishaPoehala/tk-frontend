import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursorPositionsService {
  isAtTheBottom(id: number) {
    if(this.set[id]){
      return true;
    }

    return this.set[id];
  }

  constructor() {
    this.set = {};
   }

  public set:{[chatId:number]:boolean};
}
