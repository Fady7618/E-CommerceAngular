import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  baseUrl = 'https://fakestoreapi.com/';

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}products`).pipe(
      map(response => ({
        data: response
      }))
    );
  }

  getProductsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.baseUrl}products/category/${category}`).pipe(
      map(response => ({
        data: response
      }))
    );
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}products/${id}`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}products/categories`);
  }
}
