import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { CartService } from '../../Services/cart.service';
import { GlobalService } from '../../Services/global.service';
import { Product } from '../../Interfaces/productInterface';
import Swal from 'sweetalert2';
import { WishlistService } from '../../Services/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.css']
})
export class SingleProductComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  related: Product[] = [];
  main_image: string = '';
  activeImageIndex: number = 0;
  quantity: number = 1;
  sizes: string[] = [];
  productId: number = 0;
  loading: boolean = true;
  colors: Array<{ value: string; name: string }> = [
    { value: '#ff0000', name: 'Red' },
    { value: '#00ff00', name: 'Green' },
    { value: '#0000ff', name: 'Blue' }
  ];
  selectedSize: string = '';
  
  // Animation flags
  addingToCart: boolean = false;
  addingToWishlist: boolean = false;
  wishlistItems: any[] = [];
  
  // Authentication subscription
  private authSubscription: Subscription;

  // Add a property to track cart items
  cartItems: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private globalService: GlobalService,
    private wishlistService: WishlistService
  ) {
    // Subscribe to authentication state changes
    this.authSubscription = this.globalService.loginState$.subscribe(isLoggedIn => {
      if (!isLoggedIn) {
        // Clear wishlist items when user logs out
        this.wishlistItems = [];
        this.cartItems = []; // Clear cart items too
      } else {
        // Reload wishlist and cart when user logs in
        this.loadWishlist();
        this.loadCart(); // Load cart when user logs in
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = parseInt(params['id']);
      if (this.productId) {
        this.loadProduct();
        
        // Only load wishlist and cart if user is logged in
        if (this.globalService.is_login) {
          this.loadWishlist();
          this.loadCart(); // Add this to load cart data
        } else {
          this.wishlistItems = []; 
          this.cartItems = []; // Clear cart items when not logged in
        }
      } else {
        this.router.navigate(['/404']);
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadProduct() {
    this.loading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        console.log('Raw product from API:', product);
        
        // Calculate discounted price
        const discountedPrice = product.price * (1 - product.discountPercentage / 100);
        
        // Normalize the product data for DummyJSON API
        this.product = {
          ...product,
          name: product.title,
          price_after: parseFloat(discountedPrice.toFixed(2)),
          price: parseFloat(product.price.toString()),
          detail: {
            name: product.title,
            desc: product.description
          },
          gallery: product.images?.map(img => ({ name: img })) || [{ name: product.thumbnail }]
        };
        
        this.main_image = product.thumbnail || product.images?.[0] || '';
        this.sizes = ['S', 'M', 'L', 'XL'];
        this.loading = false;
        this.loadRelatedProducts();
        console.log('Processed product:', this.product);
      },
      error: (err: any) => {
        console.error('Error loading product:', err);
        this.loading = false;
        
        Swal.fire({
          title: 'Product Not Found',
          text: 'The product you are looking for does not exist.',
          icon: 'error',
          confirmButtonText: 'Go Back to Products'
        }).then(() => {
          this.router.navigate(['/products']);
        });
      }
    });
  }

  loadRelatedProducts() {
    if (this.product?.category) {
      this.productService.getProductsByCategory(this.product.category).subscribe({
        next: (res: any) => {
          this.related = (res.data || [])
            .filter((item: Product) => item.id !== this.productId)
            .map((product: Product) => {
              const discountedPrice = product.price * (1 - product.discountPercentage / 100);
              return {
                ...product,
                name: product.title,
                price_after: parseFloat(discountedPrice.toFixed(2)),
                price: parseFloat(product.price.toString()),
                image: product.thumbnail,
                addingToCart: false,
                addingToWishlist: false
              };
            })
            .slice(0, 4);
        },
        error: (err: any) => {
          console.error('Error loading related products:', err);
        }
      });
    }
  }

  changeImage(index: number, imageName: string) {
    this.activeImageIndex = index;
    this.main_image = imageName;
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  addToCart() {
    if (!this.globalService.is_login) {
      // User is not logged in, show alert
      Swal.fire({
        title: 'Login Required',
        text: 'Please login or create an account to add items to your cart',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#28a745'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to login page
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate to signup page
          this.router.navigate(['/signup']);
        }
      });
      return;
    }
    
    if (!this.product) return;
    
    this.addingToCart = true;
    
    const cartItem = {
      product_id: this.product.id,
      name: this.product.name || this.product.title,
      price: this.product.price,
      price_after: this.product.price_after,
      image: this.product.image || this.product.thumbnail,
      qty: this.quantity,
      size: this.selectedSize || '',
    };
    
    this.cartService.addToCart(cartItem).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.addingToCart = false;
        }, 600);

        this.loadCart();
        
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
          title: `${this.product?.name || 'Product'} added to cart!`
        });
      },
      error: (err) => {
        this.addingToCart = false;
        Swal.fire({
          title: 'Error!',
          text: err.error?.message || 'Failed to add product to cart.',
          icon: 'error',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }
  
  toggleWishlist() {
    if (!this.globalService.is_login) {
      // User is not logged in, show alert
      Swal.fire({
        title: 'Login Required',
        text: 'Please login or create an account to add items to your wishlist',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#28a745'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to login page
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate to signup page
          this.router.navigate(['/signup']);
        }
      });
      return;
    }
    
    if (!this.product) return;
    
    const isInWishlist = this.isInWishlist(this.product.id);
    
    if (isInWishlist) {
      this.removeFromWishlist();
    } else {
      this.addToWishlist();
    }
  }
  
  addToWishlist() {
    if (!this.product) return;
    
    this.addingToWishlist = true;
    
    const wishlistItem = {
      product_id: this.product.id,
      name: this.product.name || this.product.title,
      price: this.product.price,
      price_after: this.product.price_after,
      image: this.product.image || this.product.thumbnail,
      description: this.product.description,
      category: this.product.category,
      brand: this.product.brand
    };
    
    this.wishlistService.addToWishlist(wishlistItem).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.addingToWishlist = false;
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
          title: `${this.product?.name || 'Product'} added to wishlist! 💖`
        });
      },
      error: (err) => {
        this.addingToWishlist = false;
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
  
  removeFromWishlist() {
    if (!this.product) return;
    
    const wishlistItem = this.wishlistItems.find(item => 
      (item.product_id || item.id) === this.product?.id
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
            title: `${this.product?.name || 'Product'} removed from wishlist`
          });
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
        }
      });
    }
  }
  
  loadWishlist() {
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlistItems = res.products || res.data || [];
      },
      error: (err) => {
        console.error('Error loading wishlist:', err);
      }
    });
  }

  // Add this method to the SingleProductComponent class
  isInCart(productId: number): boolean {
    // Check if the product exists in cart items
    if (!productId || !this.cartItems || !this.cartItems.length) return false;
    
    return this.cartItems.some(item => 
      (item.product_id === productId) || (item.id === productId)
    );
  }

  // Update the loadCart method to fetch cart items
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

  isInWishlist(productId: number): boolean {
    return this.wishlistItems.some(item => 
      (item.product_id || item.id) === productId
    );
  }

  // Handle image errors
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/300x300?text=No+Image';
  }

  // Add related product to cart
  addRelatedToCart(product: Product) {
    if (!this.globalService.is_login) {
      // User is not logged in, show alert
      Swal.fire({
        title: 'Login Required',
        text: 'Please login or create an account to add items to your cart',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#28a745'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to login page
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate to signup page
          this.router.navigate(['/signup']);
        }
      });
      return;
    }
    
    product.addingToCart = true;
    
    const cartItem = {
      product_id: product.id,
      name: product.name || product.title,
      price: product.price,
      price_after: product.price_after,
      image: product.image || product.thumbnail,
      qty: 1,
      size: '',
    };
    
    this.cartService.addToCart(cartItem).subscribe({
      next: (res) => {
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
      error: (err) => {
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
  }

  // Toggle wishlist for related product
  toggleRelatedWishlist(product: Product) {
    if (!this.globalService.is_login) {
      // User is not logged in, show alert
      Swal.fire({
        title: 'Login Required',
        text: 'Please login or create an account to add items to your wishlist',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Sign Up',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#28a745'
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to login page
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Navigate to signup page
          this.router.navigate(['/signup']);
        }
      });
      return;
    }
    
    if (this.isInWishlist(product.id)) {
      this.removeRelatedFromWishlist(product);
    } else {
      this.addRelatedToWishlist(product);
    }
  }

  // Add related product to wishlist
  addRelatedToWishlist(product: Product) {
    product.addingToWishlist = true;
    
    const wishlistItem = {
      product_id: product.id,
      name: product.name || product.title,
      price: product.price,
      price_after: product.price_after,
      image: product.image || product.thumbnail,
      description: product.description,
      category: product.category,
      brand: product.brand
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

  // Remove related product from wishlist
  removeRelatedFromWishlist(product: Product) {
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

  // Get stock status for a product
  getStockStatus(product: Product): string {
    if (!product) return '';
    if (product.stock <= 0) return 'Out of Stock';
    if (product.stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  // Get stock status color for a product
  getStockStatusColor(product: Product): string {
    if (!product) return '';
    if (product.stock <= 0) return 'text-danger';
    if (product.stock <= 10) return 'text-warning';
    return 'text-success';
  }
}