import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {UserModel} from "../models/UserModel";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getCurrentUser(userId: string) :Observable<UserModel> {
    return this.http.get<UserModel>(`api/users/getBy/${userId}`)
  }

  getAllUser() : Observable<UserModel[]> {
    return this.http.get<UserModel[]>('api/user/all');
  }
}
