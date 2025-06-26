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
    console.log('Starting to load categories...');
    
    this.productService.getCategories().subscribe({
      next: (categories: any[]) => {
        console.log('Processed categories from API:', categories);
        
        if (Array.isArray(categories) && categories.length > 0) {
          // Map the processed categories to your component's format
          this.bottomCategories = categories
            .slice(0, 8) // Limit to 8 categories for display
            .map(category => ({
              category_data: {
                category_name: this.formatCategoryName(category.name),
                category_slug: category.slug
              }
            }));
          
          console.log('Final formatted categories:', this.bottomCategories);
        } else {
          console.warn('No valid categories received, using fallback');
          this.setFallbackCategories();
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.setFallbackCategories();
        this.loading = false;
      }
    });
  }

  // Update format method to ensure it handles strings properly
  formatCategoryName(categoryName: string): string {
    if (!categoryName || typeof categoryName !== 'string') {
      return 'Category';
    }
    
    return categoryName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Fallback categories if API fails
  private setFallbackCategories(): void {
    this.bottomCategories = [
      {
        category_data: {
          category_name: "Beauty",
          category_slug: "beauty"
        }
      },
      {
        category_data: {
          category_name: "Fragrances", 
          category_slug: "fragrances"
        }
      },
      {
        category_data: {
          category_name: "Furniture",
          category_slug: "furniture"
        }
      },
      {
        category_data: {
          category_name: "Groceries",
          category_slug: "groceries"
        }
      },
      {
        category_data: {
          category_name: "Smartphones",
          category_slug: "smartphones"
        }
      },
      {
        category_data: {
          category_name: "Laptops",
          category_slug: "laptops"
        }
      },
      {
        category_data: {
          category_name: "Men's Shirts",
          category_slug: "mens-shirts"
        }
      },
      {
        category_data: {
          category_name: "Women's Dresses",
          category_slug: "womens-dresses"
        }
      }
    ];
  }
}
