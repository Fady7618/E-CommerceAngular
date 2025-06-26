import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../Services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../Services/cart.service';
import { WishlistService } from '../../Services/wishlist.service';
import { GlobalService } from '../../Services/global.service';
import Swal from 'sweetalert2';

// Define interfaces for better type safety
interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
  // Additional properties for normalized product
  name?: string;
  price_after?: number;
  addingToCart?: boolean;
  addingToWishlist?: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categoryName: string = '';
  loading = false;
  wishlistItems: any[] = [];

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryName = params['name'];
      this.loadProducts();
    });
    this.loadWishlist();
  }

  loadProducts() {
    this.loading = true;
    if (this.categoryName) {
      // Convert URL-friendly category name back to API format
      const apiCategoryName = this.convertCategoryName(this.categoryName);
      console.log('Loading category:', apiCategoryName);
      
      this.productService.getProductsByCategory(apiCategoryName).subscribe({
        next: (res: any) => {
          this.products = (res.data || []).map((product: Product) => this.normalizeProduct(product));
          this.loading = false;
          console.log('Products loaded by category:', this.products);
        },
        error: (err: any) => {
          console.error('Error loading products:', err);
          this.products = [];
          this.loading = false;
        }
      });
    } else {
      // Load all products
      this.productService.getAllProducts().subscribe({
        next: (res: any) => {
          this.products = (res.data || []).map((product: Product) => this.normalizeProduct(product));
          this.loading = false;
          console.log('All products loaded:', this.products);
        },
        error: (err: any) => {
          console.error('Error loading products:', err);
          this.products = [];
          this.loading = false;
        }
      });
    }
  }

  // Convert URL-friendly category names to API format
  convertCategoryName(categoryName: string): string {
    const categoryMap: { [key: string]: string } = {
      'mens-clothing': "men's clothing",
      'men-clothing': "men's clothing",
      'mens-casual-premium-slim-fit-t-shirts': "men's clothing",
      'womens-clothing': "women's clothing",
      'women-clothing': "women's clothing",
      'electronics': 'electronics',
      'jewelery': 'jewelery',
      'jewelry': 'jewelery'
    };
    
    return categoryMap[categoryName.toLowerCase()] || categoryName;
  }

  // Normalize product data from FakeStore API
  normalizeProduct(product: Product): Product {
    return {
      ...product,
      name: product.title || product.name || 'Product',
      price_after: parseFloat(product.price.toString()), // Use the actual price as the discounted price
      price: parseFloat((product.price * 1.2).toFixed(2)), // Create an original price (20% higher for display)
      image: product.image
    };
  }

  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlistItems = res.products || [];
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      }
    });
  }

  addToCart(product: Product) {
    if (this.globalService.isLoggedIn() || true) {
      product.addingToCart = true;
      
      console.log('Adding product to cart:', product);
      
      const cartItem = {
        product_id: product.id,
        qty: 1,
        name: product.name || product.title || 'Product',
        price: product.price || 0,
        price_after: product.price_after || product.price || 0,
        image: product.image || ''
      };
      
      console.log('Cart item structure:', cartItem);
      
      this.cartService.addToCart(cartItem).subscribe({
        next: (res: any) => {
          setTimeout(() => {
            product.addingToCart = false;
          }, 600);

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
            title: `${product.name || product.title} added to cart!`
          });
        },
        error: (err: any) => {
          product.addingToCart = false;
          Swal.fire({
            title: 'Error!',
            text: err.error?.message || 'Failed to add product to cart.',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleWishlist(product: Product) {
    if (this.globalService.isLoggedIn() || true) {
      const isInWishlist = this.isInWishlist(product.id);
      
      if (isInWishlist) {
        this.removeFromWishlist(product);
      } else {
        this.addToWishlist(product);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  addToWishlist(product: Product) {
    product.addingToWishlist = true;
    
    console.log('Adding to wishlist - Full product object:', product);
    
    const wishlistItem = {
      product_id: product.id,
      name: product.name || product.title,
      price: product.price,
      price_after: product.price_after || product.price,
      image: product.image,
      description: product.description,
      category: product.category
    };

    console.log('Wishlist item structure:', wishlistItem);

    this.wishlistService.addToWishlist(wishlistItem).subscribe({
      next: (res) => {
        setTimeout(() => {
          product.addingToWishlist = false;
        }, 600);

        this.loadWishlist();

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#ff69b4',
          color: 'white',
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'success',
          title: `${product.name || product.title} added to wishlist! 💖`
        });
      },
      error: (err) => {
        product.addingToWishlist = false;
        Swal.fire({
          title: 'Error!',
          text: err.error?.message || 'Failed to add product to wishlist.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  removeFromWishlist(product: Product) {
    const wishlistItem = this.wishlistItems.find(item => 
      (item.product_id || item.id) === product.id
    );

    if (wishlistItem) {
      this.wishlistService.removeFromWishlist(wishlistItem.id || wishlistItem.wishlist_id).subscribe({
        next: (res) => {
          this.loadWishlist();

          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            background: '#6c757d',
            color: 'white'
          });

          Toast.fire({
            icon: 'info',
            title: `${product.name || product.title} removed from wishlist`
          });
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
        }
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems.some(item => 
      (item.product_id || item.id) === productId
    );
  }
}
