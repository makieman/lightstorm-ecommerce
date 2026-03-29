import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <!-- Mobile Overlay Backdrop -->
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 bg-slate-900/50 z-[990] md:hidden backdrop-blur-sm transition-opacity"
      (click)="closeSidebar()">
    </div>

    <!-- Sidebar -->
    <aside 
      class="sidebar fixed md:sticky top-0 left-0 h-screen bg-white md:border-r border-slate-200 flex flex-col transition-transform duration-300 w-64 shadow-2xl md:shadow-none z-[1000] transform md:translate-x-0"
      [class.-translate-x-full]="!isOpen"
      [class.translate-x-0]="isOpen">
      
      <div class="sidebar-topbar p-4 md:p-5 flex items-center justify-end">
        <button class="md:hidden text-slate-500 hover:text-slate-800 p-2" (click)="closeSidebar()">
          <i class="bi bi-x-lg text-xl"></i>
        </button>
      </div>

      <nav class="flex-1 px-4 mt-2 md:mt-4 space-y-2 overflow-y-auto">
        <a routerLink="/admin" [routerLinkActiveOptions]="{exact: true}" routerLinkActive="active-link" class="nav-item" (click)="closeSidebar()">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Dashboard</span>
        </a>
        <a routerLink="/admin/product" routerLinkActive="active-link" class="nav-item" (click)="closeSidebar()">
          <i class="bi bi-box-seam-fill"></i>
          <span>Products</span>
        </a>
        <a routerLink="/admin/users" routerLinkActive="active-link" class="nav-item" (click)="closeSidebar()">
          <i class="bi bi-people-fill"></i>
          <span>Users</span>
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active-link" class="nav-item" (click)="closeSidebar()">
          <i class="bi bi-cart-check-fill"></i>
          <span>Orders</span>
        </a>
        <a routerLink="/admin/banners" routerLinkActive="active-link" class="nav-item" (click)="closeSidebar()">
          <i class="bi bi-megaphone-fill"></i>
          <span>Banners</span>
        </a>
      </nav>

      <div class="p-4 mt-auto border-t border-slate-100 bg-white">
        <button class="logout-btn w-full px-4 py-3 rounded-xl flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors" (click)="onLogout()">
          <i class="bi bi-box-arrow-left"></i>
          <span class="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
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
    .sidebar-topbar {
      min-height: 4.5rem;
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<boolean>();
  @Output() logout = new EventEmitter<void>();

  closeSidebar() {
    this.isOpen = false;
    this.toggle.emit(false);
  }

  onLogout(): void {
    this.logout.emit();
  }
}
