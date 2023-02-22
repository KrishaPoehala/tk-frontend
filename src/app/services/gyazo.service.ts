import { environment } from 'src/environments/environment';
import { HttpService } from 'src/app/services/http.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn:'any'
})
export class GyazoService {

  constructor(private http:HttpService) { }

  uploadImage(image:Blob){
    const data = new FormData();
    data.append("imagedata", image, "groupPhoto");
    
    return fetch(this.getUrl('https://upload.gyazo.com/api/upload'), {
      method:'post',
      body:data,
    });
  }

  getUrl(url:string){
    return `${url}?access_token=${environment.gyazoAccessToken}`;
  }
}
