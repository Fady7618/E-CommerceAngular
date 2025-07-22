import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  baseUrl = 'https://dummyjson.com/';

  constructor(private http: HttpClient) { }

  getAllProducts(page = 1, limit = 20): Observable<any> {
    const skip = (page - 1) * limit;
    return this.http.get(`${this.baseUrl}products?limit=${limit}&skip=${skip}`).pipe(
      map((response: any) => ({
        data: response.products || [],
        total: response.total || 0
      })),
      catchError(error => {
        // console.error('Error fetching products:', error);
        return of({ data: [], total: 0 });
      })
    );
  }

  getProductsByCategory(category: string, page = 1, limit = 20): Observable<any> {
    const skip = (page - 1) * limit;
    return this.http.get(`${this.baseUrl}products/category/${encodeURIComponent(category)}?limit=${limit}&skip=${skip}`).pipe(
      map((response: any) => ({
        data: response.products || [],
        total: response.total || 0
      })),
      catchError(error => {
        // console.error('Error fetching products by category:', error);
        return of({ data: [], total: 0 });
      })
    );
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}products/${id}`).pipe(
      catchError(error => {
        // console.error('Error fetching product by ID:', error);
        throw error;
      })
    );
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}products/categories`).pipe(
      map((response: any) => {
        // console.log('RAW RESPONSE:', response);
        // console.log('SAMPLE CATEGORY:', response[0]);
        // console.log('SAMPLE KEYS:', response[0] ? Object.keys(response[0]) : 'No keys');
        
        // Process response based on its structure
        let categories = [];
        
        if (Array.isArray(response)) {
          categories = response.map(cat => {
            // If it's an object with name and slug properties
            if (cat && typeof cat === 'object') {
              return {
                name: cat.name || (cat.title || ''),
                slug: cat.slug || cat.id || ''
              };
            }
            // If it's a simple string
            else if (typeof cat === 'string') {
              return {
                name: cat,
                slug: cat
              };
            }
            return null;
          }).filter(cat => cat !== null);
        }
        
        return categories;
      }),
      catchError(error => {
        // console.error('ProductService - Error fetching categories:', error);
        // Return fallback categories
        return of([
          {name: 'Beauty', slug: 'beauty'},
          {name: 'Fragrances', slug: 'fragrances'},
          {name: 'Furniture', slug: 'furniture'},
          {name: 'Groceries', slug: 'groceries'},
          {name: 'Smartphones', slug: 'smartphones'},
          {name: 'Laptops', slug: 'laptops'},
          {name: 'Mens Shirts', slug: 'mens-shirts'},
          {name: 'Womens Dresses', slug: 'womens-dresses'}
        ]);
      })
    );
  }
}
