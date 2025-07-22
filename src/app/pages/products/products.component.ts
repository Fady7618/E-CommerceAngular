import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  categoryName: string = '';
  loading = false;
  loadingMore = false;
  showGoUpButton: boolean = false;
  wishlistItems: any[] = [];
  cartItems: any[] = [];
  private authSubscription: Subscription;

  // Pagination state
  page = 1;
  limit = 20;
  totalProducts = 0;

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
      this.page = 1;
      this.products = [];
      this.loadProducts();
    });

    if (this.globalService.is_login) {
      this.loadWishlist();
      this.loadCart();
    } else {
      this.wishlistItems = [];
      this.cartItems = [];
    }

    this.authSubscription = this.globalService.loginState$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadWishlist();
        this.loadCart();
      } else {
        this.wishlistItems = [];
        this.cartItems = [];
      }
    });

    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  loadProducts(loadMore = false) {
    if (loadMore) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }
    const serviceCall = this.categoryName
      ? this.productService.getProductsByCategory(this.convertCategoryName(this.categoryName), this.page, this.limit)
      : this.productService.getAllProducts(this.page, this.limit);

    serviceCall.subscribe({
      next: (res: any) => {
        const newProducts = (res.data || []).map((product: Product) => this.normalizeProduct(product));
        this.products = loadMore ? [...this.products, ...newProducts] : newProducts;
        this.totalProducts = res.total || this.products.length;
        this.loading = false;
        this.loadingMore = false;
      },
      error: (err: any) => {
        this.products = [];
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  onLoadMore() {
    this.page++;
    this.loadProducts(true);
  }

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
    return categoryMap[categoryName?.toLowerCase()] || categoryName;
  }

  normalizeProduct(product: Product): Product {
    const discountedPrice = product.price * (1 - product.discountPercentage / 100);
    return {
      ...product,
      name: product.title,
      price_after: parseFloat(discountedPrice.toFixed(2)),
      price: parseFloat(product.price.toString()),
      image: product.thumbnail || (product.images && product.images[0]) || ''
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

  addToCart(product: Product) {
    product.addingToCart = true;
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
    this.cartService.addToCart(cartItem).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          product.addingToCart = false;
        }, 600);

        if (res.message === 'You must be logged in to add items to cart.') {
          Swal.fire({
            title: 'Login Required',
            text: 'Please login or create an account to add items to your cart.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'Sign Up',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#28a745'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/signup']);
            }
          });
          return;
        }

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#28a745',
          color: 'white',
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
  }

  toggleWishlist(product: Product) {
    if (this.globalService.is_login) {
      const isInWishlist = this.isInWishlist(product.id);
      if (isInWishlist) {
        this.removeFromWishlist(product);
      } else {
        this.addToWishlist(product);
      }
    } else {
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
          this.router.navigate(['/login']);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.router.navigate(['/signup']);
        }
      });
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
      next: (res: any) => {
        setTimeout(() => {
          product.addingToWishlist = false;
        }, 600);

        if (res.message === 'You must be logged in to add items to wishlist.') {
          Swal.fire({
            title: 'Login Required',
            text: 'Please login or create an account to add items to your wishlist.',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Login',
            cancelButtonText: 'Sign Up',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#28a745'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              this.router.navigate(['/signup']);
            }
          });
          return;
        }

        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          background: '#28a745',
          color: 'white',
        });

        Toast.fire({
          icon: 'success',
          title: `${product.name || product.title} added to wishlist! 💖`
        });
      },
      error: (err: any) => {
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

  isInCart(productId: number): boolean {
    if (!productId || !this.cartItems || !this.cartItems.length) return false;
    return this.cartItems.some(item =>
      (item.product_id === productId) || (item.id === productId)
    );
  }

  getStockStatus(product: Product): string {
    if (product.stock <= 0) return 'Out of Stock';
    if (product.stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusColor(product: Product): string {
    if (product.stock <= 0) return 'text-danger';
    if (product.stock <= 10) return 'text-warning';
    return 'text-success';
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.defaultImage;
      target.onerror = null;
    }
  }

  handleScroll() {
    this.showGoUpButton = window.scrollY > 500;
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
