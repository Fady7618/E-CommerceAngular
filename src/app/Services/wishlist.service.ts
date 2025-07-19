import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from './auth.service'; // <-- Import AuthService

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  baseUrl = 'https://fakestoreapi.com/';
  private wishlist: any[] = [];
  private wishlistSubject = new BehaviorSubject<any[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private Http: HttpClient,
    private auth: AuthService // <-- Inject AuthService
  ) { 
    this.loadWishlistFromStorage();
  }
  
  private loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('wishlist_items');
    if (savedWishlist) {
      this.wishlist = JSON.parse(savedWishlist);
      this.wishlistSubject.next(this.wishlist);
    }
  }
  
  private clearWishlistData() {
    this.wishlist = [];
    this.wishlistSubject.next(this.wishlist);
  }

  private saveWishlist() {
    localStorage.setItem('wishlist_items', JSON.stringify(this.wishlist));
    this.wishlistSubject.next(this.wishlist);
  }

  getWishlist(): Observable<any> {
    return of({
      total: this.wishlist.length,
      products: this.wishlist,
      data: this.wishlist
    });
  }

  addToWishlist(item: any): Observable<any> {
    // Prevent adding to wishlist if not authenticated
    if (!this.auth.isAuthenticated) {
      return of({ message: 'You must be logged in to add items to wishlist.' });
    }

    const existingIndex = this.wishlist.findIndex(wishlistItem => 
      (wishlistItem.product_id || wishlistItem.id) === (item.product_id || item.id)
    );
    if (existingIndex === -1) {
      const wishlistItem = {
        id: Date.now(),
        wishlist_id: Date.now(),
        product_id: item.product_id || item.id,
        name: item.name || item.title || 'Product',
        price: parseFloat(item.price) || 0,
        price_after: parseFloat(item.price_after || item.price) || 0,
        image: this.validateImageUrl(item.image),
        details: {
          name: item.name || item.title || 'Product',
          price: parseFloat(item.price) || 0,
          price_after: parseFloat(item.price_after || item.price) || 0,
          image: this.validateImageUrl(item.image),
          description: item.description || item.desc || '',
          category: item.category || ''
        }
      };
      this.wishlist.push(wishlistItem);
      this.saveWishlist();
    } else {
      return of({ message: 'Product already in wishlist' });
    }
    return of({ message: 'Product added to wishlist successfully' });
  }

  removeFromWishlist(itemId: any): Observable<any> {
    const initialLength = this.wishlist.length;
    this.wishlist = this.wishlist.filter(item => 
      item.id !== itemId && 
      item.wishlist_id !== itemId && 
      item.product_id !== itemId
    );
    if (this.wishlist.length < initialLength) {
      this.saveWishlist();
      return of({ message: 'Product removed from wishlist successfully' });
    } else {
      return of({ message: 'Product not found in wishlist' });
    }
  }

  clearWishlist(): Observable<any> {
    this.wishlist = [];
    this.saveWishlist();
    return of({ message: 'Wishlist cleared successfully' });
  }

  isInWishlist(productId: any): boolean {
    return this.wishlist.some(item => 
      (item.product_id || item.id) === productId
    );
  }

  getWishlistCount(): number {
    return this.wishlist.length;
  }

  private validateImageUrl(imageUrl: string): string {
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTEyLjA3MSA1MCAxMjIgNTkuOTI4OSAxMjIgNzJDMTIyIDg0LjA3MTEgMTEyLjA3MSA5NCAxMDAgOTRDODcuOTI4OSA5NCA3OCA4NC4wNzExIDc4IDcyQzc4IDU5LjkyODkgODcuOTI4OSA1MCAxMDAgNTBaTTEwMCAxNTBDMTI3LjYxNCAxNTAgMTUwIDEyNy42MTQgMTUwIDEwMEMxNTAgNzIuMzg1OCAxMjcuNjE0IDUwIDEwMCA1MEM3Mi4zODU4IDUwIDUwIDcyLjM4NTggNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg1OCAxNTAgMTAwIDE1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cg==';
    if (!imageUrl || imageUrl.trim() === '') {
      return defaultImage;
    }
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(imageUrl)) {
      return defaultImage;
    }
    return imageUrl;
  }
}
