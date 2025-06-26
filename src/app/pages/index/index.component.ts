import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../Services/product.service';

interface CategoryData {
  category_name: string;
  category_slug: string;
}

interface Category {
  category_data: CategoryData;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  bottomCategories: Category[] = [];
  loading = false;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.productService.getCategories().subscribe({
      next: (categories: string[]) => {
        console.log('Categories from API:', categories);
        
        // Map FakeStore API categories to your desired format
        this.bottomCategories = categories.map((category: string, index: number) => ({
          category_data: {
            category_name: this.formatCategoryName(category),
            category_slug: this.createCategorySlug(category)
          }
        }));
        
        console.log('Formatted categories:', this.bottomCategories);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        // Fallback categories if API fails
        this.bottomCategories = [
          {
            category_data: {
              category_name: "Men's Clothing",
              category_slug: "mens-clothing"
            }
          },
          {
            category_data: {
              category_name: "Women's Clothing", 
              category_slug: "womens-clothing"
            }
          },
          {
            category_data: {
              category_name: "Electronics",
              category_slug: "electronics"
            }
          },
          {
            category_data: {
              category_name: "Jewelery",
              category_slug: "jewelery"
            }
          }
        ];
        this.loading = false;
      }
    });
  }

  formatCategoryName(category: string): string {
    // Convert API category names to display format
    const nameMap: { [key: string]: string } = {
      "men's clothing": "Men's Clothing",
      "women's clothing": "Women's Clothing",
      "electronics": "Electronics",
      "jewelery": "Jewelery"
    };
    
    return nameMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  createCategorySlug(category: string): string {
    // Convert API category names to URL-friendly slugs
    const slugMap: { [key: string]: string } = {
      "men's clothing": "mens-clothing",
      "women's clothing": "womens-clothing", 
      "electronics": "electronics",
      "jewelery": "jewelery"
    };
    
    return slugMap[category] || category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
