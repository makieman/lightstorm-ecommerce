import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = '/api/users';
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get(this.API_URL, { withCredentials: true });
  }

  getUserById(id: string) {
    return this.http.get(this.API_URL + `/${id}`, { withCredentials: true });
  }

  createUser(user: any) {
    return this.http.post(this.API_URL, user, { withCredentials: true });
  }

  updateUser(user: any) {
    return this.http.put(this.API_URL + `/${user._id}`, user, { withCredentials: true });
  }

  deleteUser(id: string) {
    return this.http.delete(this.API_URL + `/${id}`, { withCredentials: true });
  }
}
