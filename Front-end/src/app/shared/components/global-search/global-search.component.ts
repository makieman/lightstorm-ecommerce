import { Component, OnInit, OnDestroy, HostListener, ElementRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchService, SearchSuggestion } from '../../../core/services/search.service';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @Output() searchExecuted = new EventEmitter<string>();

  searchQuery = '';
  suggestions: SearchSuggestion[] = [];
  recentSearches: string[] = [];
  isDropdownOpen = false;
  isLoading = false;
  activeIndex = -1;

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  constructor(
    private searchService: SearchService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    // Load recent searches
    this.recentSearches = this.searchService.getRecentSearches();

    // Setup debounced search
    const searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        this.isLoading = true;
        return this.searchService.getSearchSuggestions(query, 6);
      })
    ).subscribe({
      next: (suggestions) => {
        this.suggestions = suggestions;
        this.isLoading = false;
        this.activeIndex = -1;
      },
      error: () => {
        this.isLoading = false;
        this.suggestions = [];
      }
    });

    this.subscriptions.push(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Handle input changes
   */
  onInputChange(event: Event | string): void {
    const value = typeof event === 'string' ? event : (event.target as HTMLInputElement).value;
    this.searchQuery = value;
    if (value.length >= 2) {
      this.searchSubject.next(value);
      this.isDropdownOpen = true;
    } else {
      this.suggestions = [];
      this.isDropdownOpen = value.length === 0;
    }
  }

  getCategorySuggestions(): SearchSuggestion[] {
    return this.suggestions.filter(s => s.type === 'category');
  }

  getProductSuggestions(): SearchSuggestion[] {
    return this.suggestions.filter(s => s.type === 'product');
  }

  hasCategories(): boolean {
    return this.getCategorySuggestions().length > 0;
  }

  hasProducts(): boolean {
    return this.getProductSuggestions().length > 0;
  }

  getRecentSearches(): string[] {
    return this.recentSearches;
  }

  /**
   * Handle focus - show recent searches
   */
  onFocus(): void {
    if (this.searchQuery.length === 0) {
      this.recentSearches = this.searchService.getRecentSearches();
      this.isDropdownOpen = true;
    }
  }

  /**
   * Close dropdown when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  /**
   * Handle keyboard navigation
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const totalItems = this.getTotalItems();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = (this.activeIndex + 1) % totalItems;
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = this.activeIndex <= 0 ? totalItems - 1 : this.activeIndex - 1;
        break;

      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0) {
          this.selectActiveItem();
        } else {
          this.executeSearch();
        }
        break;

      case 'Escape':
        this.isDropdownOpen = false;
        break;
    }
  }

  /**
   * Get total number of items in dropdown
   */
  private getTotalItems(): number {
    const recentCount = this.searchQuery.length === 0 ? this.recentSearches.length : 0;
    const suggestionCount = this.suggestions.length;
    return recentCount + suggestionCount;
  }

  /**
   * Select currently active item
   */
  private selectActiveItem(): void {
    const recentCount = this.searchQuery.length === 0 ? this.recentSearches.length : 0;

    if (this.activeIndex < recentCount) {
      // Selected recent search
      this.searchQuery = this.recentSearches[this.activeIndex];
      this.executeSearch();
    } else {
      // Selected suggestion
      const suggestionIndex = this.activeIndex - recentCount;
      this.selectSuggestion(this.suggestions[suggestionIndex]);
    }
  }

  /**
   * Select a suggestion
   */
  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchService.saveRecentSearch(suggestion.name);
    this.isDropdownOpen = false;

    if (suggestion.type === 'category') {
      // Navigate to products page with category filter
      this.router.navigate(['/products'], {
        queryParams: { category: suggestion.name }
      });
    } else {
      // Navigate to product detail or search results
      if (suggestion.id) {
        this.router.navigate(['/product', suggestion.id]);
      } else {
        this.router.navigate(['/products'], {
          queryParams: { search: suggestion.name }
        });
      }
    }
  }

  /**
   * Execute search
   */
  executeSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.searchService.saveRecentSearch(this.searchQuery);
    this.isDropdownOpen = false;
    this.searchExecuted.emit(this.searchQuery);

    this.router.navigate(['/products'], {
      queryParams: { search: this.searchQuery }
    });
  }

  /**
   * Select recent search
   */
  selectRecentSearch(search: string): void {
    this.searchQuery = search;
    this.executeSearch();
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(event: Event): void {
    event.stopPropagation();
    this.searchService.clearRecentSearches();
    this.recentSearches = [];
  }

  /**
   * Check if item is active
   */
  isActive(index: number): boolean {
    return this.activeIndex === index;
  }

  /**
   * Get availability color
   */
  getAvailabilityColor(availability?: string): string {
    switch (availability) {
      case 'In Stock': return 'text-green-600';
      case 'Low Stock': return 'text-orange-500';
      case 'Out of Stock': return 'text-red-500';
      default: return 'text-slate-400';
    }
  }

  /**
   * Format price
   */
  formatPrice(price?: number): string {
    if (!price) return '';
    return `KSh ${price.toLocaleString()}`;
  }
}