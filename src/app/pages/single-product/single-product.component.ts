import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { CartService } from '../../Services/cart.service';
import { GlobalService } from '../../Services/global.service';
import { Product } from '../../Interfaces/productInterface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-single-product',
  templateUrl: './single-product.component.html',
  styleUrls: ['./single-product.component.css']
})
export class SingleProductComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private globalService: GlobalService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.productId = parseInt(params['id']);
      if (this.productId) {
        this.loadProduct();
      } else {
        this.router.navigate(['/404']);
      }
    });
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
                image: product.thumbnail
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
    if (!this.product) {
      Swal.fire({
        title: 'Error!',
        text: 'Product information is not available.',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (this.product.stock <= 0) {
      Swal.fire({
        title: 'Out of Stock!',
        text: 'This product is currently out of stock.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (this.quantity > this.product.stock) {
      Swal.fire({
        title: 'Insufficient Stock!',
        text: `Only ${this.product.stock} items available.`,
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    if (this.globalService.isLoggedIn() || true) {
      const cartItem = {
        product_id: this.productId,
        qty: this.quantity,
        name: this.product.name || this.product.title,
        price: this.product.price,
        price_after: this.product.price_after,
        image: this.main_image,
        brand: this.product.brand,
        stock: this.product.stock
      };
      
      this.cartService.addToCart(cartItem).subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'Success!',
            text: `${this.product?.name} added to cart successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err: any) => {
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

  getStockStatus(): string {
    if (!this.product) return '';
    if (this.product.stock <= 0) return 'Out of Stock';
    if (this.product.stock <= 10) return 'Low Stock';
    return 'In Stock';
  }

  getStockStatusColor(): string {
    if (!this.product) return '';
    if (this.product.stock <= 0) return 'text-danger';
    if (this.product.stock <= 10) return 'text-warning';
    return 'text-success';
  }
}