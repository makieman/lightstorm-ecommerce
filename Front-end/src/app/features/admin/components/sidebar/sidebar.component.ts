import { Component, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <aside class="sidebar h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 w-64 shadow-sm">
      <a [routerLink]="['/']" class="p-6 flex items-center gap-3">
        <img src="assets/lightstorm logo.png" alt="Lightstorm Logo" class="app-logo h-[40px]">
      </a>

      <nav class="flex-1 px-4 mt-6 space-y-2">
        <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active-link" class="nav-item">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/admin/product" routerLinkActive="active-link" class="nav-item">
          <i class="bi bi-box-seam-fill"></i>
          <span>Products</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active-link" class="nav-item">
          <i class="bi bi-people-fill"></i>
          <span>Users</span>
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active-link" class="nav-item">
          <i class="bi bi-cart-check-fill"></i>
          <span>Orders</span>
        </a>
      </nav>

      <div class="p-4 mt-auto border-t border-slate-100">
        <button class="logout-btn w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors" (click)="onLogout()">
          <i class="bi bi-box-arrow-left"></i>
          <span class="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      z-index: 1000;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      color: #64748b;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
    }
    .nav-item:hover {
      background-color: #f1f5f9;
      color: #1e293b;
    }
    .active-link {
      background-color: #f8fafc !important;
      color: #EF4444 !important; /* Red accent */
      border: 1px solid #fee2e2;
    }
    .nav-item i {
      font-size: 1.25rem;
    }
    .logout-btn {
      border: none;
      background: transparent;
      cursor: pointer;
    }
  `]
})
export class SidebarComponent {
  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
