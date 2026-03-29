import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BannerService, Banner } from '../../../../core/services/banner.service';
import { CoreProductService } from '../../../../core/services/core-product.service';

@Component({
  selector: 'app-banner-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="px-4 py-8 sm:px-8 space-y-8 bg-slate-50 min-h-screen">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-800">Promotional Banners</h1>
          <p class="text-sm text-slate-500 mt-1">Create and manage dynamic offers across the platform.</p>
        </div>
        <button *ngIf="!showForm" (click)="openCreateForm()"
                class="bg-[var(--brand-navy)] hover:bg-[var(--brand-coral)] text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-sm shadow-md">
          <i class="bi bi-plus-lg"></i> Create New Banner
        </button>
      </div>

      <!-- Form Section -->
      <div *ngIf="showForm" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fade-in">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-slate-800">{{ editingBannerId ? 'Edit Banner' : 'Create New Banner' }}</h2>
          <button (click)="cancelForm()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        <form [formGroup]="bannerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Title -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Title *</label>
              <input formControlName="title" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all" placeholder="e.g. Flash Sale!">
            </div>

            <!-- Subtitle -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtitle *</label>
              <input formControlName="subtitle" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all" placeholder="e.g. Up to 50% off all Solar Panels">
            </div>

            <!-- CTA Text -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">CTA Text</label>
              <input formControlName="ctaText" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all">
            </div>

            <!-- CTA Link -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">CTA Link</label>
              <input formControlName="ctaLink" type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all">
            </div>

            <!-- Discount -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount %</label>
              <input formControlName="discount" type="number" min="0" max="100" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all">
            </div>

            <!-- Background Color -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Theme / Gradient</label>
              <select formControlName="bgColor" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all bg-white">
                <option *ngFor="let g of gradients" [value]="g.value">{{ g.label }}</option>
              </select>
            </div>

            <!-- Start Date -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time (Optional)</label>
              <input formControlName="startDate" type="datetime-local" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all">
            </div>

            <!-- End Date -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time (Optional)</label>
              <input formControlName="endDate" type="datetime-local" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all">
            </div>

            <!-- Product Selection -->
            <div class="col-span-1 md:col-span-2 space-y-2 relative">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Products for Flash Sale</label>
              
              <!-- Search Input -->
              <div class="relative mb-2">
                <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input type="text" 
                       (input)="onSearchProducts($event)" 
                       placeholder="Search products by name..." 
                       class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--brand-navy)] focus:border-transparent outline-none transition-all text-sm">
              </div>

              <div class="border border-slate-200 rounded-xl overflow-y-auto h-56 bg-slate-50 p-2 space-y-1">
                <div *ngIf="loadingProducts" class="text-xs text-slate-400 p-2">Loading products...</div>
                <div *ngIf="!loadingProducts && filteredProducts.length === 0" class="text-xs text-slate-400 p-2 text-center">No products match your search.</div>
                
                <label *ngFor="let product of filteredProducts" class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                  <input type="checkbox" 
                         [checked]="isProductSelected(product._id)" 
                         (change)="toggleProduct(product._id)"
                         class="w-4 h-4 rounded text-[var(--brand-navy)] focus:ring-[var(--brand-navy)] border-slate-300">
                  <div class="flex-shrink-0 w-10 h-10 rounded bg-white p-0.5 border border-slate-100">
                    <img [src]="product.images && product.images.length ? product.images[0] : product.image" class="w-full h-full object-contain">
                  </div>
                  <span class="text-sm font-medium text-slate-700 truncate flex-1">{{ product.title }}</span>
                  <span class="text-sm font-bold text-slate-500">KSh {{ product.price | number }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-4 border-t border-slate-100">
            <input type="checkbox" formControlName="isActive" id="isActive" class="w-5 h-5 rounded text-[var(--brand-navy)] focus:ring-[var(--brand-navy)] border-slate-300">
            <label for="isActive" class="text-sm font-bold text-slate-700 cursor-pointer">Set Active immediately</label>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="cancelForm()" class="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" [disabled]="bannerForm.invalid || isSubmitting" class="bg-[var(--brand-navy)] hover:bg-[var(--brand-coral)] disabled:opacity-50 text-white px-8 py-2.5 rounded-xl font-bold shadow-md transition-all">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              {{ editingBannerId ? 'Update Banner' : 'Create Banner' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Data Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Banner Content</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Discount</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="isLoading" class="animate-pulse">
                <td colspan="5" class="p-8 text-center text-slate-400">Loading banners...</td>
              </tr>
              <tr *ngIf="!isLoading && banners.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-400">No banners found. Click Create New Banner to add one.</td>
              </tr>
              
              <tr *ngFor="let banner of banners" class="hover:bg-slate-50/50 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg shadow-inner flex shrink-0" [class]="'bg-gradient-to-br ' + banner.bgColor"></div>
                    <div>
                      <p class="font-bold text-slate-800 text-sm">{{ banner.title }}</p>
                      <p class="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{{ banner.subtitle }}</p>
                      <div class="mt-1 flex gap-1 items-center">
                        <span class="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-[10px] font-bold">
                          <i class="bi bi-box-seam me-1"></i> {{ banner.linkedProducts?.length || 0 }} Items
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span *ngIf="banner.discount > 0" class="inline-flex items-center px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold">{{ banner.discount }}% OFF</span>
                  <span *ngIf="!banner.discount" class="text-slate-400 text-xs">-</span>
                </td>
                <td class="p-4">
                  <div class="text-xs">
                    <p *ngIf="banner.startDate" class="text-slate-600"><span class="text-slate-400 font-medium">Starts:</span> {{ banner.startDate | date:'shortDate' }}</p>
                    <p *ngIf="banner.endDate" class="text-slate-600"><span class="text-slate-400 font-medium">Ends:</span> {{ banner.endDate | date:'shortDate' }}</p>
                    <p *ngIf="!banner.startDate && !banner.endDate" class="text-slate-400 italic">No schedule</p>
                  </div>
                </td>
                <td class="p-4">
                  <button (click)="toggleActive(banner)" 
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                          [ngClass]="banner.isActive ? 'bg-green-500' : 'bg-slate-300'">
                    <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                          [ngClass]="banner.isActive ? 'translate-x-6' : 'translate-x-1'"></span>
                  </button>
                </td>
                <td class="p-4 text-right space-x-2">
                  <button (click)="openEditForm(banner)" class="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[var(--brand-navy)] transition-colors inline-flex items-center justify-center">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button (click)="deleteBanner(banner._id)" class="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center">
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BannerManagerComponent implements OnInit {
  banners: Banner[] = [];
  isLoading = true;
  isSubmitting = false;
  
  showForm = false;
  editingBannerId: string | null = null;
  bannerForm: FormGroup;

  allProducts: any[] = [];
  filteredProducts: any[] = [];
  loadingProducts = false;
  productSearchTerm = '';

  gradients = [
    { label: 'Solar Orange', value: 'from-orange-500 via-yellow-400 to-green-500' },
    { label: 'Energy Red', value: 'from-red-600 via-orange-500 to-yellow-400' },
    { label: 'Premium Blue', value: 'from-blue-600 via-purple-500 to-pink-500' },
    { label: 'Eco Green', value: 'from-green-500 via-teal-400 to-cyan-500' },
    { label: 'Dark Navy', value: 'from-slate-800 via-slate-700 to-slate-600' },
  ];

  constructor(
    private bannerService: BannerService,
    private productService: CoreProductService,
    private fb: FormBuilder
  ) {
    this.bannerForm = this.fb.group({
      title: ['', Validators.required],
      subtitle: ['', Validators.required],
      ctaText: ['Shop Now'],
      ctaLink: ['/products'],
      discount: [0],
      bgColor: [this.gradients[0].value],
      startDate: [''],
      endDate: [''],
      isActive: [false],
      linkedProducts: [[]]
    });
  }

  ngOnInit() {
    this.loadBanners();
    this.loadProducts();
  }

  loadProducts() {
    this.loadingProducts = true;
    this.productService.getAllProducts({ limit: 200 }).subscribe({
      next: (res) => {
        this.allProducts = res.products || [];
        this.filteredProducts = [...this.allProducts];
        this.loadingProducts = false;
      },
      error: () => this.loadingProducts = false
    });
  }

  onSearchProducts(event: any) {
    this.productSearchTerm = event.target.value.toLowerCase();
    if (!this.productSearchTerm) {
      this.filteredProducts = [...this.allProducts];
    } else {
      this.filteredProducts = this.allProducts.filter(p => p.title.toLowerCase().includes(this.productSearchTerm));
    }
  }

  isProductSelected(productId: string): boolean {
    const current = this.bannerForm.get('linkedProducts')?.value || [];
    return current.includes(productId);
  }

  toggleProduct(productId: string) {
    const current = this.bannerForm.get('linkedProducts')?.value || [];
    if (current.includes(productId)) {
      this.bannerForm.patchValue({ linkedProducts: current.filter((id: string) => id !== productId) });
    } else {
      this.bannerForm.patchValue({ linkedProducts: [...current, productId] });
    }
  }

  loadBanners() {
    this.isLoading = true;
    this.bannerService.getAllBanners().subscribe({
      next: (res) => {
        if (res.success) {
          this.banners = res.banners;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load banners', err);
        this.isLoading = false;
      }
    });
  }

  openCreateForm() {
    this.editingBannerId = null;
    this.bannerForm.reset({
      ctaText: 'Shop Now',
      ctaLink: '/products',
      discount: 0,
      bgColor: this.gradients[0].value,
      isActive: false,
      linkedProducts: []
    });
    this.showForm = true;
  }

  openEditForm(banner: Banner) {
    this.editingBannerId = banner._id;
    
    // Format dates for html datetime-local input
    const formatForInput = (dateString: string | null) => {
      if (!dateString) return '';
      const d = new Date(dateString);
      // 'YYYY-MM-DDThh:mm'
      return d.toISOString().slice(0, 16);
    };

    this.bannerForm.patchValue({
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      discount: banner.discount,
      bgColor: banner.bgColor,
      isActive: banner.isActive,
      startDate: formatForInput(banner.startDate),
      endDate: formatForInput(banner.endDate),
      linkedProducts: banner.linkedProducts?.map((p: any) => typeof p === 'string' ? p : p._id) || []
    });
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm() {
    this.showForm = false;
    this.editingBannerId = null;
  }

  onSubmit() {
    if (this.bannerForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.bannerForm.value;
    
    // Cleanup empty dates
    const payload = {
      ...formValue,
      startDate: formValue.startDate ? new Date(formValue.startDate).toISOString() : null,
      endDate: formValue.endDate ? new Date(formValue.endDate).toISOString() : null
    };

    if (this.editingBannerId) {
      this.bannerService.updateBanner(this.editingBannerId, payload).subscribe({
        next: () => {
          this.loadBanners();
          this.cancelForm();
          this.isSubmitting = false;
        },
        error: () => this.isSubmitting = false
      });
    } else {
      this.bannerService.createBanner(payload).subscribe({
        next: () => {
          this.loadBanners();
          this.cancelForm();
          this.isSubmitting = false;
        },
        error: () => this.isSubmitting = false
      });
    }
  }

  toggleActive(banner: Banner) {
    // Optimistic update
    banner.isActive = !banner.isActive;
    this.bannerService.toggleBanner(banner._id).subscribe({
      error: () => {
        // Revert on failure
        banner.isActive = !banner.isActive;
      }
    });
  }

  deleteBanner(id: string) {
    if (confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      this.bannerService.deleteBanner(id).subscribe({
        next: () => this.loadBanners(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
