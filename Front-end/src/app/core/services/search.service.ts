import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface SearchSuggestion {
  type: 'product' | 'category';
  id?: string;
  name: string;
  category?: string;
  price?: number;
  availability?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  quantity?: number;
  icon?: string;
}

export interface SearchResult {
  products: any[];
  categories: string[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = '/api/products';

  private categories = [
    { name: 'Solar Panel', slug: 'solar', icon: 'bi-sun' },
    { name: 'Inverter', slug: 'inverter', icon: 'bi-gear-wide-connected' },
    { name: 'Battery', slug: 'battery', icon: 'bi-battery-charging' },
    { name: 'Lithium Battery', slug: 'lithium-battery', icon: 'bi-battery-full' },
    { name: 'Gel Battery', slug: 'gel-battery', icon: 'bi-battery-half' },
    { name: 'Charge Controller', slug: 'charge-controller', icon: 'bi-cpu' },
    { name: 'Solar Lighting', slug: 'solar-lighting', icon: 'bi-lightbulb' },
    { name: 'Flood Lights & Street Lights', slug: 'flood-lights-street-lights', icon: 'bi-lamp' },
    { name: 'Garden Lights', slug: 'garden-lights', icon: 'bi-flower1' },
    { name: 'Mounting Systems', slug: 'mounting-systems', icon: 'bi-tools' },
    { name: 'Water Heaters', slug: 'water-heaters', icon: 'bi-droplet-half' },
    { name: 'Family Solar Packages', slug: 'family-solar-packages', icon: 'bi-house-heart' },
    { name: 'Borehole', slug: 'borehole', icon: 'bi-droplet' },
    { name: 'Electrical', slug: 'electrical', icon: 'bi-lightning' }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Get predictive search suggestions
   */
  getSearchSuggestions(query: string, limit: number = 6): Observable<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const lowerQuery = query.toLowerCase();

    // Get matching categories
    const categorySuggestions: SearchSuggestion[] = this.categories
      .filter(cat => cat.name.toLowerCase().includes(lowerQuery))
      .map(cat => ({
        type: 'category',
        name: cat.name,
        icon: cat.icon
      }));

    // Get matching products from API
    return this.http.get<any>(`${this.apiUrl}?search=${encodeURIComponent(query)}&limit=${limit}`).pipe(
      map(response => {
        const products = response.products || [];
        const productSuggestions: SearchSuggestion[] = products.map((p: any) => ({
          type: 'product',
          id: p._id,
          name: p.title,
          category: p.category,
          price: p.price,
          availability: this.getAvailabilityStatus(p.quantity),
          quantity: p.quantity
        }));

        // Combine and return
        return [...categorySuggestions.slice(0, 2), ...productSuggestions.slice(0, limit)];
      }),
      catchError(() => of(categorySuggestions.slice(0, limit)))
    );
  }

  /**
   * Search products with filters
   */
  searchProducts(params: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Observable<any> {
    let url = `${this.apiUrl}?`;
    const queryParams: string[] = [];

    if (params.search) queryParams.push(`search=${encodeURIComponent(params.search)}`);
    if (params.category) queryParams.push(`category=${encodeURIComponent(params.category)}`);
    if (params.minPrice) queryParams.push(`minPrice=${params.minPrice}`);
    if (params.maxPrice) queryParams.push(`maxPrice=${params.maxPrice}`);
    if (params.page) queryParams.push(`page=${params.page}`);
    if (params.limit) queryParams.push(`limit=${params.limit}`);
    if (params.sort) queryParams.push(`sort=${params.sort}`);

    url += queryParams.join('&');

    return this.http.get(url);
  }

  /**
   * Get all available categories
   */
  getCategories(): { name: string; slug: string; icon: string }[] {
    return [...this.categories];
  }

  /**
   * Get category by slug
   */
  getCategoryBySlug(slug: string): { name: string; slug: string; icon: string } | undefined {
    return this.categories.find(c => c.slug === slug.toLowerCase());
  }

  /**
   * Get category by name
   */
  getCategoryByName(name: string): { name: string; slug: string; icon: string } | undefined {
    return this.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Save recent search to localStorage
   */
  saveRecentSearch(query: string): void {
    if (!query) return;
    
    const recentSearches = this.getRecentSearches();
    const updatedSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  }

  /**
   * Get recent searches from localStorage
   */
  getRecentSearches(): string[] {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    localStorage.removeItem('recentSearches');
  }

  private getAvailabilityStatus(quantity: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= 5) return 'Low Stock';
    return 'In Stock';
  }
}