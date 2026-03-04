import { Component } from '@angular/core';
import { TopCardsComponent } from '../top-cards/top-cards.component';
import { FeedsComponent } from '../feeds/feeds.component';
import { SalesSummaryComponent } from '../sales-summary/sales-summary.component';
import { OrdersComponent } from '../orders/orders.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    TopCardsComponent,
    FeedsComponent,
    SalesSummaryComponent,
    OrdersComponent,
    CommonModule
  ],
  template: `
    <div class="dashboard-content animate-fade-in p-4 md:p-8 pt-4">
      <div class="mb-6 md:mb-10 flex flex-col gap-1">
        <h1 class="text-2xl md:text-4xl font-black text-[#1E293B] tracking-tight">System Insights</h1>
        <p class="text-slate-400 font-semibold text-[10px] md:text-xs uppercase tracking-widest">Real-time Performance & Sales Analytics</p>
      </div>

      <div class="mb-6 md:mb-10">
        <app-top-cards></app-top-cards>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-6 md:mb-10">
        <div class="lg:col-span-8 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100">
          <div class="flex justify-between mb-6 flex-col sm:flex-row sm:items-center gap-3">
            <h3 class="text-sm font-black text-[#1E293B] uppercase tracking-wider">Revenue Stream</h3>
            <span class="text-[10px] font-bold text-[#84CC16] bg-green-50 px-2 py-1 rounded-md uppercase w-fit">Weekly Progress</span>
          </div>
          <app-sales-summary></app-sales-summary>
        </div>
        <div class="lg:col-span-4 self-stretch">
          <app-feeds></app-feeds>
        </div>
      </div>

      <div class="row bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="col-12">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-2 h-6 bg-[#EF4444] rounded-full"></div>
            <h3 class="text-sm font-black text-[#1E293B] uppercase tracking-wider">Order Ledger</h3>
          </div>
          <app-orders></app-orders>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-content {
      padding: 1rem;
    }
    @media (min-width: 768px) {
      .dashboard-content {
        padding: 1.5rem;
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminDashboardComponent { }
