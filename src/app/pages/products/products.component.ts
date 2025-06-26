import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../Services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../Services/cart.service';
import { WishlistService } from '../../Services/wishlist.service';
import { GlobalService } from '../../Services/global.service';
import { Product } from '../../Interfaces/productInterface';
import Swal from 'sweetalert2';

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

  // Default placeholder image
  defaultImage = 'https://via.placeholder.com/300x300?text=No+Image';

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
      'beauty': 'beauty',
      'fragrances': 'fragrances',
      'furniture': 'furniture',
      'groceries': 'groceries',
      'home-decoration': 'home-decoration',
      'kitchen-accessories': 'kitchen-accessories',
      'laptops': 'laptops',
      'mens-shirts': 'mens-shirts',
      'mens-shoes': 'mens-shoes',
      'mens-watches': 'mens-watches',
      'mobile-accessories': 'mobile-accessories',
      'motorcycle': 'motorcycle',
      'skin-care': 'skin-care',
      'smartphones': 'smartphones',
      'sports-accessories': 'sports-accessories',
      'sunglasses': 'sunglasses',
      'tablets': 'tablets',
      'tops': 'tops',
      'vehicle': 'vehicle',
      'womens-bags': 'womens-bags',
      'womens-dresses': 'womens-dresses',
      'womens-jewellery': 'womens-jewellery',
      'womens-shoes': 'womens-shoes',
      'womens-watches': 'womens-watches'
    };
    
    return categoryMap[categoryName.toLowerCase()] || categoryName;
  }

  // Normalize product data from DummyJSON API
  normalizeProduct(product: Product): Product {
    const discountedPrice = product.price * (1 - product.discountPercentage / 100);
    
    return {
      ...product,
      name: product.title,
      price_after: parseFloat(discountedPrice.toFixed(2)), // Calculate discounted price
      price: parseFloat(product.price.toString()), // Original price
      image: product.thumbnail || product.images[0] || ''
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
        name: product.name || product.title,
        price: product.price,
        price_after: product.price_after || product.price,
        image: product.image || product.thumbnail,
        brand: product.brand,
        stock: product.stock
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
    
    const wishlistItem = {
      product_id: product.id,
      name: product.name || product.title,
      price: product.price,
      price_after: product.price_after,
      image: product.image || product.thumbnail,
      description: product.description,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      stock: product.stock
    };

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
          background: '#28a745',
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

  // Helper method to get stock status
  getStockStatus(product: Product): string {
    if (product.stock <= 0) return 'Out of Stock';
    if (product.stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  // Helper method to get stock status color
  getStockStatusColor(product: Product): string {
    if (product.stock <= 0) return 'text-danger';
    if (product.stock <= 10) return 'text-warning';
    return 'text-success';
  }

  // Image error handler with proper TypeScript typing
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.defaultImage;
      target.onerror = null; // Prevent infinite loop
    }
  }
}
