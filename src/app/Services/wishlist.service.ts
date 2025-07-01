import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  baseUrl = 'https://fakestoreapi.com/';
  private wishlist: any[] = [];
  private wishlistSubject = new BehaviorSubject<any[]>([]);
  public wishlist$ = this.wishlistSubject.asObservable();
  private authSubscription: any;

  constructor(
    private Http: HttpClient,
    private globalService: GlobalService
  ) { 
    // Load wishlist from localStorage on service initialization
    this.loadWishlistFromStorage();
    
    // Subscribe to auth state changes
    this.authSubscription = this.globalService.loginState$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        // Clear wishlist when user logs out
        this.clearWishlistData();
      } else {
        // Reload wishlist when user logs in
        this.loadWishlistFromStorage();
      }
    });
  }
  
  private loadWishlistFromStorage() {
    if (this.globalService.is_login) {
      const savedWishlist = localStorage.getItem('wishlist_items');
      if (savedWishlist) {
        this.wishlist = JSON.parse(savedWishlist);
        this.wishlistSubject.next(this.wishlist);
      }
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
    console.log('WishlistService: Received item:', item);
    
    // Check if product already exists in wishlist
    const existingIndex = this.wishlist.findIndex(wishlistItem => 
      (wishlistItem.product_id || wishlistItem.id) === (item.product_id || item.id)
    );
    
    if (existingIndex === -1) {
      // Create wishlist item with complete data
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
      console.log('WishlistService: Added item:', wishlistItem);
    } else {
      console.log('WishlistService: Item already in wishlist');
      return of({ message: 'Product already in wishlist' });
    }
    
    return of({ message: 'Product added to wishlist successfully' });
  }

  removeFromWishlist(itemId: any): Observable<any> {
    console.log('WishlistService: Removing item with ID:', itemId);
    const initialLength = this.wishlist.length;
    this.wishlist = this.wishlist.filter(item => 
      item.id !== itemId && 
      item.wishlist_id !== itemId && 
      item.product_id !== itemId
    );
    
    if (this.wishlist.length < initialLength) {
      this.saveWishlist();
      console.log('WishlistService: Item removed, remaining items:', this.wishlist);
      return of({ message: 'Product removed from wishlist successfully' });
    } else {
      console.log('WishlistService: Item not found for removal');
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
