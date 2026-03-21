import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreProductService } from '@app/core/services/core-product.service';
import { AIService } from '@app/core/services/ai.service';
import { Category } from '@app/features/shop/pages/products/product.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <!-- Backdrop with blur -->
      <div 
        class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
        (click)="close()">
      </div>

      <!-- Modal Container -->
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white rounded-t-2xl z-10">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Create New Product</h2>
            <p class="text-sm text-gray-500 mt-0.5">Add a new item to your inventory</p>
          </div>
          <button 
            type="button" 
            (click)="close()" 
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Content (Scrollable) -->
        <form [formGroup]="createForm" (ngSubmit)="submitForm()" class="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div class="space-y-6">
            
            <!-- Product Name -->
            <div class="col-span-1 md:col-span-2">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Product Name <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                formControlName="title"
                placeholder="e.g. Solar Max 3000"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                [class.border-red-300]="isFieldInvalid('title')"
              >
              @if (isFieldInvalid('title')) {
                <p class="mt-1 text-xs text-red-500">Product name is required</p>
              }
            </div>

            <!-- Category & Price Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Category -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select 
                    formControlName="productCategory"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled selected>Select Category</option>
                    @for (cat of categories; track cat._id) {
                      <option [value]="cat.name">{{ cat.name }}</option>
                    }
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <!-- Price -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Price (KSH) <span class="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  formControlName="price"
                  placeholder="0.00"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                  [class.border-red-300]="isFieldInvalid('price')"
                >
                @if (isFieldInvalid('price')) {
                  <p class="mt-1 text-xs text-red-500">Valid price is required</p>
                }
              </div>
            </div>

            <!-- Product Images (Multiple) -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Product Images <span class="text-red-400">(up to 5)</span>
                <span class="ml-1 text-gray-400 font-normal normal-case tracking-normal text-[10px]">— upload first, then let AI auto-fill the form</span>
              </label>
              <div class="flex gap-2 items-center mb-3">
                <input 
                  type="file" 
                  multiple
                  (change)="onFileSelected($event)"
                  accept="image/*"
                  class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                >
                <button
                  type="button"
                  (click)="analyzeImageWithAI()"
                  [disabled]="!imageFile || isAnalyzingImage()"
                  class="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  @if (isAnalyzingImage()) {
                    <svg class="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  } @else {
                    <span>✨ AI Analyze</span>
                  }
                </button>
              </div>
              
              <!-- Image Preview Grid -->
              @if (selectedImages.length > 0) {
                <div class="image-preview-grid grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                  @for (img of selectedImages; let i = $index; track i) {
                    <div class="relative group rounded-lg overflow-hidden border-2 transition-all" [class.border-red-500]="i === 0" [class.border-gray-200]="i !== 0" [class.ring-2]="i === 0" [class.ring-red-500]="i === 0">
                      <img [src]="img.preview" alt="Product image" class="w-full h-20 object-cover" />
                      @if (i === 0) {
                        <span class="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">Main</span>
                      }
                      <button 
                        type="button"
                        (click)="removeImage(i)"
                        class="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  }
                </div>
                <p class="text-xs text-gray-500">
                  {{ selectedImages.length }} image(s) selected. First image = main thumbnail.
                </p>
              }
            </div>

            <!-- Description -->
            <div class="relative">
              <div class="flex justify-between items-end mb-2">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Description <span class="text-red-500">*</span>
                </label>
                <button 
                  type="button" 
                  (click)="generateDescription()"
                  [disabled]="isGenerating()"
                  class="group flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  @if (isGenerating()) {
                    <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Writing...</span>
                  } @else {
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>AI Write</span>
                  }
                </button>
              </div>
              <textarea 
                formControlName="details"
                rows="4"
                placeholder="Enter product details..."
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                [class.border-red-300]="isFieldInvalid('details')"
              ></textarea>
              @if (isFieldInvalid('details')) {
                <p class="mt-1 text-xs text-red-500">Description is required</p>
              }
              <div class="absolute bottom-3 right-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Quantity <span class="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                formControlName="productQuantity"
                placeholder="0"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                [class.border-red-300]="isFieldInvalid('productQuantity')"
              >
              @if (isFieldInvalid('productQuantity')) {
                <p class="mt-1 text-xs text-red-500">Valid quantity is required</p>
              }
            </div>

            <!-- Divider -->
            <div class="relative py-2">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-100"></div>
              </div>
              <div class="relative flex justify-center">
                <span class="px-3 bg-white text-xs font-medium text-gray-400 uppercase tracking-widest">Specifications (Optional)</span>
              </div>
            </div>

            <!-- Optional Specs Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Wattage
                </label>
                <input 
                  type="text" 
                  formControlName="wattage"
                  placeholder="e.g. 450W"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Voltage
                </label>
                <input 
                  type="text" 
                  formControlName="voltage"
                  placeholder="e.g. 12V / 24V"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                >
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Battery Type
                </label>
                <input 
                  type="text" 
                  formControlName="batteryType"
                  placeholder="e.g. Lithium Ion"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                >
              </div>
            </div>



          </div>
        </form>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl flex justify-end gap-3 z-10">
          <button 
            type="button" 
            (click)="close()"
            class="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            (click)="submitForm()"
            [disabled]="createForm.invalid"
            class="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
          >
            Create Product
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `]
})
export class CreateProductDialogComponent implements OnInit {
  private readonly defaultCategoryNames: string[] = [
    'Solar Panel',
    'Inverter',
    'Battery',
    'Lithium Battery',
    'Gel Battery',
    'Charge Controller',
    'Solar Lighting',
    'Flood Lights & Street Lights',
    'Garden Lights',
    'Mounting Systems',
    'Water Heaters',
    'Family Solar Packages'
  ];

  createForm: any;
  imageFile: File | null = null;
  selectedImages: { file: File; preview: string }[] = [];
  isGenerating = signal(false);
  isAnalyzingImage = signal(false);
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: CoreProductService,
    private aiService: AIService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialogRef<CreateProductDialogComponent>,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      details: ['', Validators.required],
      productQuantity: ['', [Validators.required, Validators.min(0)]],
      productCategory: ['', Validators.required],
      lowStockThreshold: [5],
      wattage: [''],
      voltage: [''],
      batteryType: [''],
    });
  }

  ngOnInit() {
    // Keep a complete category list visible even if backend categories are missing/inactive.
    this.categories = this.defaultCategoryNames.map((name, index) => ({
      _id: `fallback-${index}`,
      name
    } as Category));

    this.productService.getCategories().subscribe({
      next: (cats) => {
        const merged = new Map<string, Category>();

        this.categories.forEach((cat) => {
          if (cat?.name) merged.set(cat.name.toLowerCase(), cat);
        });

        (cats || []).forEach((cat) => {
          if (cat?.name) merged.set(cat.name.toLowerCase(), cat);
        });

        this.categories = Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.createForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  async generateDescription() {
    const title = this.createForm.get('title')?.value;
    const category = this.createForm.get('productCategory')?.value;

    if (!title) {
      alert('Please enter a product name first.');
      return;
    }

    this.isGenerating.set(true);

    this.aiService.generateDescription(title, category || '').subscribe({
      next: (response) => {
        if (response.success && response.description) {
          this.createForm.patchValue({ details: response.description });
        } else {
          alert(response.error || 'Failed to generate description.');
        }
        this.isGenerating.set(false);
      },
      error: (error) => {
        console.error('Error generating description:', error);
        alert('Failed to generate description. Please try again.');
        this.isGenerating.set(false);
      }
    });
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files as FileList).slice(0, 5); // Limit to 5 images
      this.selectedImages = (files as File[]).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      // Set first image as legacy single image for backward compatibility
      if (this.selectedImages.length > 0) {
        this.imageFile = this.selectedImages[0].file;
      }
    }
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.selectedImages[index].preview);
    this.selectedImages.splice(index, 1);
    if (this.selectedImages.length === 0) {
      this.imageFile = null;
    } else if (index === 0) {
      this.imageFile = this.selectedImages[0].file;
    }
  }

  analyzeImageWithAI(): void {
    if (!this.imageFile) return;

    this.isAnalyzingImage.set(true);
    const formData = new FormData();
    formData.append('image', this.imageFile);

    this.http.post<any>('/api/ai/analyze-image', formData)
      .pipe(finalize(() => this.isAnalyzingImage.set(false)))
      .subscribe({
        next: (result) => {
          if (result.success && result.data) {
            const d = result.data;
            const patch: any = {};
            if (d.productName && !this.createForm.get('title')?.value) patch.title = d.productName;
            if (d.category) patch.productCategory = d.category;
            if (d.description) patch.details = d.description;
            if (d.wattage) patch.wattage = d.wattage;
            if (d.voltage) patch.voltage = d.voltage;
            if (d.batteryType) patch.batteryType = d.batteryType;
            this.createForm.patchValue(patch);
          }
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'AI analysis failed', text: 'Could not analyze image. Please try again.', timer: 3000, showConfirmButton: false });
        }
      });
  }

  close() {
    this.dialog.close();
  }

  submitForm() {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }

    const product = new FormData();
    product.append('title', this.createForm.value.title);
    product.append('price', this.createForm.value.price);
    product.append('details', this.createForm.value.details);
    product.append('quantity', this.createForm.value.productQuantity);
    product.append('category', this.createForm.value.productCategory);
    product.append('wattage', this.createForm.value.wattage || '');
    product.append('voltage', this.createForm.value.voltage || '');
    product.append('batteryType', this.createForm.value.batteryType || '');
    
    // Append all selected images (up to 5)
    this.selectedImages.forEach((img, index) => {
      product.append('images', img.file);
    });
    // For backward compatibility with single image field
    if (this.imageFile && this.selectedImages.length === 0) {
      product.append('image', this.imageFile);
    }

    this.productService.createProduct(product).subscribe(
      (data: any) => {
        this.dialog.close();
        Swal.fire({
          icon: 'success',
          title: 'Your Product Created successfully',
        }).then(() => {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['/admin/product']);
            });
        });
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
}
