import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  baseUrl = 'https://fakestoreapi.com/';
  private cart: any[] = [];

  constructor(private Http: HttpClient) { 
    // Load cart from localStorage on service initialization
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  private saveCart() {
    localStorage.setItem('cart_items', JSON.stringify(this.cart));
  }

  getCart(): Observable<any> {
    return of({
      total_cart: this.cart.length,
      products: this.cart,
      data: this.cart
    });
  }

  addToCart(item: any): Observable<any> {
    console.log('CartService: Received item:', item);
    
    // Check if product already exists in cart
    const existingIndex = this.cart.findIndex(cartItem => cartItem.product_id === item.product_id);
    
    if (existingIndex !== -1) {
      // Update quantity if product exists
      this.cart[existingIndex].qty = (this.cart[existingIndex].qty || 1) + (item.qty || 1);
      this.cart[existingIndex].details.total = parseFloat((this.cart[existingIndex].details.price_after * this.cart[existingIndex].qty).toFixed(2));
      console.log('CartService: Updated existing item:', this.cart[existingIndex]);
    } else {
      // Add new product to cart with proper structure
      const price = parseFloat(item.price) || 0;
      const priceAfter = parseFloat(item.price_after) || price;
      const quantity = item.qty || 1;
      
      const cartItem = {
        id: Date.now(), // This is the cart item ID
        cart_id: Date.now(), // For backward compatibility
        product_id: item.product_id,
        qty: quantity,
        details: {
          name: item.name || 'Product',
          price: parseFloat(price.toFixed(2)),
          price_after: parseFloat(priceAfter.toFixed(2)),
          total: parseFloat((priceAfter * quantity).toFixed(2)),
          image: this.validateImageUrl(item.image), // Store image directly
          gallary: {
            gallary_name: this.validateImageUrl(item.image) // Also store in gallary for backward compatibility
          }
        }
      };
      
      console.log('CartService: Created new cart item:', cartItem);
      this.cart.push(cartItem);
    }
    
    this.saveCart();
    console.log('CartService: Cart after adding:', this.cart);
    return of({ message: 'Product added to cart successfully' });
  }

  private validateImageUrl(imageUrl: string): string {
    // Return default base64 image if no valid URL
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3NSA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc1IiBoZWlnaHQ9Ijc1IiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0zNy41IDIwQzQyLjE5NDQgMjAgNDYgMjMuODA1NiA0NiAyOC41QzQ2IDMzLjE5NDQgNDIuMTk0NCAzNyAzNy41IDM3QzMyLjgwNTYgMzcgMjkgMzMuMTk0NCAyOSAyOC41QzI5IDIzLjgwNTYgMzIuODA1NiAyMCAzNy41IDIwWk0zNy41IDU1QzQ3LjcxNjcgNTUgNTYgNDYuNzE2NyA1NiAzNi41QzU2IDI2LjI4MzMgNDcuNzE2NyAxOCAzNy41IDE4QzI3LjI4MzMgMTggMTkgMjYuMjgzMyAxOSAzNi41QzE5IDQ2LjcxNjcgMjcuMjgzMyA1NSAzNy41IDU1WiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
    
    if (!imageUrl || imageUrl.trim() === '') {
      console.log('CartService: No image URL provided, using default');
      return defaultImage;
    }
    
    // Check if it's a valid URL pattern
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(imageUrl)) {
      console.log('CartService: Invalid image URL pattern, using default:', imageUrl);
      return defaultImage;
    }
    
    console.log('CartService: Using provided image URL:', imageUrl);
    return imageUrl;
    }

  removeFromCart(itemId: any): Observable<any> {
    this.cart = this.cart.filter(item => item.id !== itemId && item.cart_id !== itemId);
    this.saveCart();
    return of({ message: 'Product removed from cart successfully' });
  }

  updateQuantity(itemId: any, quantity: number): Observable<any> {
    const index = this.cart.findIndex(item => item.id === itemId || item.cart_id === itemId);
    if (index !== -1 && quantity > 0) {
      this.cart[index].qty = quantity;
      this.cart[index].details.total = parseFloat((this.cart[index].details.price_after * quantity).toFixed(2));
      this.saveCart();
    }
    return of({ message: 'Quantity updated successfully' });
  }

  clearCart(): Observable<any> {
    this.cart = [];
    this.saveCart();
    return of({ message: 'Cart cleared successfully' });
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => {
      return total + (item.details?.total || (item.details?.price_after * item.qty) || 0);
    }, 0);
  }
}
