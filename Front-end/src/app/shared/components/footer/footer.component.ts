import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartProductsCountService } from '@app/core/services/cart-products-count.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  cartCount: number = 0;

  constructor(
    private productsCount: CartProductsCountService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.productsCount.data$.subscribe({
      next: (data) => {
        this.zone.run(() => {
          this.cartCount = data;
          this.cdr.markForCheck();
        });
      }
    });
  }
}
