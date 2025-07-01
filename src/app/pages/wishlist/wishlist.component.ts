import { Component, OnInit } from '@angular/core';
import { WishlistService } from '../../Services/wishlist.service';
import { CartService } from '../../Services/cart.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist: any[] = [];
  total = 0;
  products: any[] = [];
  cartItems: any[] = [];
  defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTEyLjA3MSA1MCAxMjIgNTkuOTI4OSAxMjIgNzJDMTIyIDg0LjA3MTEgMTEyLjA3MSA5NCAxMDAgOTRDODcuOTI4OSA5NCA3OCA4NC4wNzExIDc4IDcyQzc4IDU5LjkyODkgODcuOTI4OSA1MCAxMDAgNTBaTTEwMCAxNTBDMTI3LjYxNCAxNTAgMTUwIDEyNy42MTQgMTUwIDEwMEMxNTAgNzIuMzg1OCAxMjcuNjE0IDUwIDEwMCA1MEM3Mi4zODU4IDUwIDUwIDcyLjM4NTggNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg1OCAxNTAgMTAwIDE1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cg==';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getWishList();
    this.loadCart();
  }

  getWishList() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        console.log('Wishlist response:', res);
        this.total = res.total || 0;
        this.products = res.products || res.data || [];
        console.log('Wishlist products:', this.products);
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
        this.products = [];
      }
    });
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cartItems = res.products || [];
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  addToWishlist(product: any) {
    this.wishlistService.addToWishlist({ product_id: product.product_id || product.id }).subscribe({
      next: (res) => {
        console.log('Added to wishlist:', res);
        Swal.fire({
          title: 'Success!',
          text: 'Product added to wishlist successfully.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
        this.getWishList(); // Refresh the list
      },
      error: (err) => {
        console.error('Error adding to wishlist:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add product to wishlist.',
          icon: 'error',
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  }

  // Update the addToCart method to include animation
  addToCart(product: any) {
    product.addingToCart = true; // Add this line to trigger animation
    
    const cartItem = {
      product_id: product.product_id || product.id,
      qty: 1,
      name: this.getProductName(product),
      price: this.getProductPriceRaw(product),
      price_after: this.getProductPriceAfterRaw(product),
      image: this.getProductImage(product)
    };

    console.log('Adding to cart from wishlist:', cartItem);

    this.cartService.addToCart(cartItem).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          product.addingToCart = false;
        }, 600);
        
        this.loadCart(); // Refresh cart items to update UI

        // Replace alert with toast notification matching the products page
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#28a745',
          color: 'white',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'success',
          title: `${this.getProductName(product)} added to cart!`
        });
      },
      error: (err: any) => {
        product.addingToCart = false; // Reset on error too
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add product to cart.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  removeItem(itemId: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this item from wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.wishlistService.removeFromWishlist(itemId).subscribe({
          next: (res) => {
            console.log('Removed from wishlist:', res);
            Swal.fire({
              title: 'Removed!',
              text: 'Product removed from wishlist.',
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });
            this.getWishList(); // Refresh the list
          },
          error: (err) => {
            console.error('Error removing from wishlist:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to remove product from wishlist.',
              icon: 'error',
              timer: 1000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  clearAllWishlist() {
    // Show confirmation dialog
    Swal.fire({
      title: 'Clear entire wishlist?',
      text: 'Are you sure you want to remove all items from your wishlist?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.wishlistService.clearWishlist().subscribe({
          next: (res) => {
            // Refresh the wishlist
            this.getWishList();
            
            // Show success message
            Swal.fire({
              title: 'Wishlist Cleared!',
              text: 'Your wishlist has been emptied.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error clearing wishlist:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to clear your wishlist.',
              icon: 'error',
              timer: 2000,
              showConfirmButton: false
            });
          }
        });
      }
    });
  }

  isInWishlist(productId: any): boolean {
    return this.products.some(item => (item.product_id || item.id) === productId);
  }

  isInCart(productId: number): boolean {
    if (!productId || !this.cartItems || !this.cartItems.length) return false;
    
    return this.cartItems.some(item => 
      (item.product_id === productId) || (item.id === productId)
    );
  }

  // Helper methods to get product data from different possible structures
  getProductName(product: any): string {
    return product.name || 
           product.details?.name || 
           product.title || 
           product.detail?.name || 
           'Product';
  }

  getProductPrice(product: any): string {
    const price = product.price || 
                  product.details?.price || 
                  product.detail?.price || 
                  0;
    return parseFloat(price).toFixed(2);
  }

  getProductPriceAfter(product: any): string {
    const priceAfter = product.price_after || 
                       product.details?.price_after || 
                       product.detail?.price_after || 
                       product.price || 
                       product.details?.price || 
                       product.detail?.price || 
                       0;
    return parseFloat(priceAfter).toFixed(2);
  }

  getProductPriceRaw(product: any): number {
    return parseFloat(product.price || 
                     product.details?.price || 
                     product.detail?.price || 
                     0);
  }

  getProductPriceAfterRaw(product: any): number {
    return parseFloat(product.price_after || 
                     product.details?.price_after || 
                     product.detail?.price_after || 
                     product.price || 
                     product.details?.price || 
                     product.detail?.price || 
                     0);
  }

  getProductImage(product: any): string {
    // Try to get image from different possible sources
    const imageUrl = product.details?.gallary?.gallary_name || 
                     product.details?.image || 
                     product.image ||
                     this.defaultImage;
    
    return this.validateImageUrl(imageUrl);
  }

  private validateImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
      return this.defaultImage;
    }
    return imageUrl;
  }

  handleImageError(event: any) {
    // Set to default image and prevent further error events
    event.target.src = this.defaultImage;
    event.target.onerror = null; // Prevent infinite loop
  }
}
