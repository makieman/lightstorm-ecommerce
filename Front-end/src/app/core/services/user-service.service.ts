import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private readonly myClient: HttpClient) { }
  private readonly URL_API = "/api/users";


  getUserById(id: string) {
    const url = `${this.URL_API}/${id}`;
    return this.myClient.get<any>(url);
  }

  updateUser(id: string, userData: any){
    const url = `${this.URL_API}/${id}`;
    console.log(userData);
    return this.myClient.put(url, userData);
  }

  forgotPassword(email: string) {
    const url = `${this.URL_API}/forgot-password`;
    return this.myClient.post<any>(url, { email });
  }

  resetPassword(token: string, password: string) {
    const url = `${this.URL_API}/reset-password`;
    return this.myClient.post<any>(url, { token, password });
  }

}
