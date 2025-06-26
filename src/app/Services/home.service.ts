import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  baseUrl = 'https://fakestoreapi.com/';

  constructor(private http: HttpClient) { }

  topCategory(): Observable<any> {
    return this.http.get<string[]>(`${this.baseUrl}products/categories`).pipe(
      map((categories: string[]) => ({
        data: categories.slice(0, 4).map((category, index) => ({
          id: index + 1,
          category_data: {
            category_name: category.charAt(0).toUpperCase() + category.slice(1).replace("'s", 's')
          }
        }))
      }))
    );
  }

  category(): Observable<any> {
    return this.http.get<string[]>(`${this.baseUrl}products/categories`).pipe(
      map((categories: string[]) => ({
        data: categories.map((category, index) => ({
          id: index + 1,
          category_data: {
            category_name: category.charAt(0).toUpperCase() + category.slice(1).replace("'s", 's')
          }
        }))
      }))
    );
  }
}
