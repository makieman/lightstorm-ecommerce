import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BannerService, Banner } from '../../../core/services/banner.service';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Skeleton loader -->
    <div *ngIf="isLoading" class="mx-4 md:mx-12 mt-4 h-64 animate-pulse bg-slate-200 shadow-sm border border-slate-100">
    </div>

    <!-- Flash Sales Banner -->
    <div *ngIf="!isLoading && banner" class="mx-4 md:mx-12 mt-4 mb-4 bg-white overflow-hidden shadow-lg border border-slate-100">
      
      <!-- Header Row (Red) -->
      <div class="flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 py-3 bg-[#e61601] text-white">
        
        <!-- Left Title -->
        <div class="flex items-center gap-2 font-bold text-lg md:text-xl drop-shadow-sm w-full sm:w-auto shrink-0 justify-center sm:justify-start">
          <span class="bg-yellow-400 text-orange-600 w-6 h-6 flex items-center justify-center rounded shadow-inner rotate-12 shrink-0">
             <i class="bi bi-lightning-charge-fill text-sm -rotate-12"></i>
          </span>
          {{ banner.title }}
        </div>
        
        <!-- Center Timer -->
        <div *ngIf="banner.endDate" class="flex-1 flex justify-center items-center font-bold text-sm md:text-base my-2 sm:my-0 w-full">
          <span class="mr-2 font-medium hidden sm:inline">Time Left:</span>
          <!-- Jumia specific styling: hours : mins : secs -->
          <span class="tracking-widest drop-shadow-md">{{ formatTimeArr()[0] }}h : {{ formatTimeArr()[1] }}m : {{ formatTimeArr()[2] }}s</span>
        </div>

        <!-- Right CTA/Dismiss -->
        <div class="flex items-center gap-6 justify-center sm:justify-end w-full sm:w-auto">
          <a [routerLink]="banner.ctaLink" class="font-bold text-sm hover:text-white/80 transition-colors shrink-0 flex items-center gap-1 group">
            {{ banner.ctaText }} 
            <i class="bi bi-chevron-right text-[10px] mt-0.5 group-hover:translate-x-0.5 transition-transform"></i>
          </a>
          
          <button (click)="dismiss()" class="text-white/40 hover:text-white transition-colors" title="Close Banner">
            <i class="bi bi-x-lg text-lg"></i>
          </button>
        </div>
      </div>

      <!-- Linked Products Row -->
      <div *ngIf="banner.linkedProducts?.length" class="p-3 md:p-4 bg-[var(--brand-sage-light)]/20 flex overflow-x-auto snap-x gap-3 md:gap-4 scrollbar-hide">
        
        <a *ngFor="let product of banner.linkedProducts" [routerLink]="['/product', product._id]" 
           class="snap-start shrink-0 w-36 md:w-[190px] bg-white rounded relative p-3 pb-4 border border-transparent hover:border-orange-500 hover:shadow-lg transition-all group flex flex-col">
          
          <!-- Discount Badge -->
          <div *ngIf="banner.discount > 0" class="absolute top-2 right-2 bg-orange-100 text-orange-600 font-extrabold text-[11px] px-1.5 py-0.5 rounded shadow-sm z-10">
            -{{ banner.discount }}%
          </div>

          <!-- Product Image -->
          <div class="w-full aspect-square mb-3 bg-white flex items-center justify-center p-1 md:p-2">
             <img [src]="product.images && product.images.length ? product.images[0] : product.image" 
                  class="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300">
          </div>

          <!-- Title -->
          <h3 class="text-xs md:text-sm text-slate-700 truncate mb-1" [title]="product.title">{{ product.title }}</h3>
          
          <!-- Pricing -->
          <div class="space-y-0.5">
            <p class="font-semibold text-slate-900 leading-none text-sm md:text-base">KSh {{ getDiscountedPrice(product.price, banner.discount) | number }}</p>
            <p class="text-[10px] md:text-xs text-slate-400 line-through leading-none" *ngIf="banner.discount > 0">KSh {{ product.price | number }}</p>
            <!-- Spacer to keep layout intact if no old price -->
            <p class="h-3 md:h-4" *ngIf="banner.discount === 0"></p>
          </div>

          <!-- Spacer to push stock bar to bottom -->
          <div class="flex-grow"></div>

          <!-- Stock Bar -->
          <div class="mt-3 text-[10px] text-slate-500 font-medium">
            <p class="mb-1">{{ product.quantity }} items left</p>
            <div class="w-full h-[5px] bg-slate-200 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-400 to-orange-500 origin-left" 
                   [style.width.%]="product.quantity > 50 ? 100 : (product.quantity / 50 * 100)"></div>
            </div>
          </div>
        </a>

      </div>

      <!-- Fallback empty body if no products linked -->
      <div *ngIf="!banner.linkedProducts?.length" class="p-8 text-center bg-slate-50">
        <p class="text-slate-600 mb-2 font-medium">{{ banner.subtitle }}</p>
        <span *ngIf="banner.discount > 0" class="inline-block bg-orange-100 text-orange-700 font-black text-2xl px-4 py-2 rounded-lg">
          {{ banner.discount }}% OFF
        </span>
      </div>
    </div>
  `,
  styles: [`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
  `]
})
export class PromoBannerComponent implements OnInit, OnDestroy {
  banner: Banner | null = null;
  isLoading = true;
  timeLeftArray = ['00', '00', '00']; // hours, mins, secs
  private timer: any;

  constructor(private bannerService: BannerService) {}

  ngOnInit() {
    if (sessionStorage.getItem('banner_dismissed_v4')) {
      this.isLoading = false;
      return;
    }
    this.bannerService.getActiveBanner().subscribe({
      next: (res) => {
        this.banner = res.banner;
        this.isLoading = false;
        if (this.banner?.endDate) {
          this.startCountdown();
        }
      },
      error: () => this.isLoading = false
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  dismiss() {
    this.banner = null;
    sessionStorage.setItem('banner_dismissed_v4', 'true');
  }

  getDiscountedPrice(price: number, discount: number): number {
    if (!discount) return price;
    return price - Math.round(price * (discount / 100));
  }

  formatTimeArr(): string[] {
    return this.timeLeftArray;
  }

  startCountdown() {
    this.updateCountdown();
    this.timer = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  updateCountdown() {
    if (!this.banner?.endDate) return;
    const end = new Date(this.banner.endDate).getTime();
    const now = Date.now();
    const diff = end - now;

    if (diff <= 0) {
      this.timeLeftArray = ['00', '00', '00'];
      if (this.banner) this.banner.endDate = null; // stop showing timer
      clearInterval(this.timer);
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    
    this.timeLeftArray = [
      String(h).padStart(2,'0'),
      String(m).padStart(2,'0'),
      String(s).padStart(2,'0')
    ];
  }
}
