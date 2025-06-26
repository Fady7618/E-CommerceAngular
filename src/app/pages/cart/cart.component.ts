import { Component, OnInit } from '@angular/core';
import { CartService } from '../../Services/cart.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  total = 0;
  products: any[] = [];
  cartTotal = 0;
  defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3NSA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc1IiBoZWlnaHQ9Ijc1IiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik0zNy41IDIwQzQyLjE5NDQgMjAgNDYgMjMuODA1NiA0NiAyOC41QzQ2IDMzLjE5NDQgNDIuMTk0NCAzNyAzNy41IDM3QzMyLjgwNTYgMzcgMjkgMzMuMTk0NCAyOSAyOC41QzI5IDIzLjgwNTYgMzIuODA1NiAyMCAzNy41IDIwWk0zNy41IDU1QzQ3LjcxNjcgNTUgNTYgNDYuNzE2NyA1NiAzNi41QzU2IDI2LjI4MzMgNDcuNzE2NyAxOCAzNy41IDE4QzI3LjI4MzMgMTggMTkgMjYuMjgzMyAxOSAzNi41QzE5IDQ2LjcxNjcgMjcuMjgzMyA1NSAzNy41IDU1WiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';

  constructor(private cart: CartService) {}

  ngOnInit() {
    this.getCart();
  }

  getCart() {
    this.cart.getCart().subscribe({
      next: (res) => {
        this.total = res.total_cart;
        this.products = res.products || [];
        this.cartTotal = this.cart.getCartTotal();
        console.log('Cart Component: Cart loaded:', this.products);
        
        // Debug each product
        this.products.forEach((product, index) => {
          console.log(`Cart Component: Product ${index}:`, product);
          console.log(`Cart Component: Product ${index} image:`, this.getProductImage(product));
        });
      },
      error: (err) => {
        console.error('Error loading cart:', err);
      }
    });
  }

  deleteCart(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Remove this item from cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cart.removeFromCart(id).subscribe({
          next: (res) => {
            this.getCart();
            Swal.fire({
              title: 'Removed!',
              text: res.message,
              icon: 'success',
              timer: 1000,
              showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error removing from cart:', err);
          }
        });
      }
    });
  }

  updateQuantity(id: number, newQuantity: number) {
    if (newQuantity < 1) {
      this.deleteCart(id);
      return;
    }
    
    this.cart.updateQuantity(id, newQuantity).subscribe({
      next: (res) => {
        this.getCart();
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
      }
    });
  }

  increaseQuantity(product: any) {
    this.updateQuantity(product.id || product.cart_id, product.qty + 1);
  }

  decreaseQuantity(product: any) {
    this.updateQuantity(product.id || product.cart_id, product.qty - 1);
  }

  formatPrice(price: any): string {
    const numPrice = parseFloat(price) || 0;
    return numPrice.toFixed(2);
  }

  getSubtotal(): number {
    return this.products.reduce((sum, product) => {
      const itemTotal = product.details?.total || (product.details?.price_after * product.qty) || 0;
      return sum + parseFloat(itemTotal);
    }, 0);
  }

  getProductImage(product: any): string {
    // Try to get image from different possible sources
    const imageUrl = product.details?.gallary?.gallary_name || 
                     product.details?.image || 
                     product.image || 
                     this.defaultImage;
    
    console.log('Cart Component: Final image URL:', imageUrl);
    return imageUrl;
  }

  handleImageError(event: any) {
    console.log('Cart Component: Image error, switching to default');
    // Set to default image and prevent further error events
    event.target.src = this.defaultImage;
    event.target.onerror = null; // Prevent infinite loop
  }
}
