import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../Services/product.service';
import { CartService } from '../../Services/cart.service';
import { GlobalService } from '../../Services/global.service';
import Swal from 'sweetalert2';

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
  detail?: {
    name: string;
    desc: string;
  };
  gallery?: Array<{ name: string }>;
}

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
        
        // Normalize the product data for FakeStore API
        this.product = {
          ...product,
          name: product.title,
          price_after: parseFloat(product.price.toString()),
          price: parseFloat((product.price * 1.2).toFixed(2)), // Create original price
          detail: {
            name: product.title,
            desc: product.description
          },
          gallery: [
            { name: product.image }
          ]
        };
        
        this.main_image = product.image;
        this.sizes = ['S', 'M', 'L', 'XL'];
        this.loading = false;
        this.loadRelatedProducts();
        console.log('Processed product:', this.product);
      },
      error: (err: any) => {
        console.error('Error loading product:', err);
        this.loading = false;
        
        // Show error message
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
            .map((product: Product) => ({
              ...product,
              name: product.title,
              price_after: parseFloat(product.price.toString()),
              price: parseFloat((product.price * 1.2).toFixed(2))
            }))
            .slice(0, 4); // Show only 4 related products
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
    this.quantity++;
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

    if (this.globalService.isLoggedIn() || true) {
      console.log('Single Product: Adding to cart, product:', this.product);
      
      const cartItem = {
        product_id: this.productId,
        qty: this.quantity,
        name: this.product.name || this.product.title || 'Product',
        price: this.product.price || 0,
        price_after: this.product.price_after || this.product.price || 0,
        image: this.main_image || this.product.image || ''
      };
      
      console.log('Single Product: Cart item structure:', cartItem);
      
      this.cartService.addToCart(cartItem).subscribe({
        next: (res: any) => {
          Swal.fire({
            title: 'Success!',
            text: `${this.product?.name || 'Product'} added to cart successfully.`,
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
}