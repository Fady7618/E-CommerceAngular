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
  defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0xMDAgNTBDMTEyLjA3MSA1MCAxMjIgNTkuOTI4OSAxMjIgNzJDMTIyIDg0LjA3MTEgMTEyLjA3MSA5NCAxMDAgOTRDODcuOTI4OSA5NCA3OCA4NC4wNzExIDc4IDcyQzc4IDU5LjkyODkgODcuOTI4OSA1MCAxMDAgNTBaTTEwMCAxNTBDMTI3LjYxNCAxNTAgMTUwIDEyNy42MTQgMTUwIDEwMEMxNTAgNzIuMzg1OCAxMjcuNjE0IDUwIDEwMCA1MEM3Mi4zODU4IDUwIDUwIDcyLjM4NTggNTAgMTAwQzUwIDEyNy42MTQgNzIuMzg1OCAxNTAgMTAwIDE1MFoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+Cg==';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getWishList();
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

  addToCart(product: any) {
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
        Swal.fire({
          title: 'Success!',
          text: 'Product added to cart successfully.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      },
      error: (err: any) => {
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add product to cart.',
          icon: 'error',
          timer: 1000,
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

  isInWishlist(productId: any): boolean {
    return this.products.some(item => (item.product_id || item.id) === productId);
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
    const imageUrl = product.image || 
                     product.details?.image || 
                     product.details?.gallary?.gallary_name || 
                     product.detail?.image || 
                     product.thumbnail || 
                     this.defaultImage;
    
    return this.validateImageUrl(imageUrl);
  }

  private validateImageUrl(imageUrl: string): string {
    if (!imageUrl || imageUrl.trim() === '') {
      return this.defaultImage;
    }
    
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(imageUrl)) {
      return this.defaultImage;
    }
    
    return imageUrl;
  }

  handleImageError(event: any) {
    event.target.src = this.defaultImage;
    event.target.onerror = null;
  }
}
