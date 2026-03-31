import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  activeSection: 'dashboard' | 'orders' | 'profile' = 'dashboard';
  user: any = null;
  orders: any[] = [];
  isLoading = true;

  // Order detail drawer
  selectedOrder: any = null;
  selectedOrderProducts: any[] = [];
  drawerOpen = false;
  drawerLoading = false;

  // Mobile sidebar
  mobileSidebarOpen = false;

  constructor(private http: HttpClient, private router: Router) { }

  get activeOrdersCount(): number {
    return this.orders.filter(o =>
      o.status !== 'Delivered' &&
      o.status !== 'Cancelled'
    ).length;
  }

  get totalSpent(): number {
    return this.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }

  getOrderProgress(status: string): number {
    const map: { [key: string]: number } = {
      'Pending': 0,
      'Confirmed': 25,
      'Processing': 50,
      'Shipped': 75,
      'Delivered': 100,
      'Cancelled': -1
    };
    return map[status] ?? 0;
  }

  getProgressSteps(): { label: string; icon: string; key: string }[] {
    return [
      { label: 'Placed', icon: '📋', key: 'Pending' },
      { label: 'Confirmed', icon: '✅', key: 'Confirmed' },
      { label: 'Processing', icon: '⚙️', key: 'Processing' },
      { label: 'Shipped', icon: '🚚', key: 'Shipped' },
      { label: 'Delivered', icon: '🎉', key: 'Delivered' },
    ];
  }

  isStepActive(status: string, stepKey: string | undefined): boolean {
    if (!stepKey) return false;
    const progress = this.getOrderProgress(status);
    const stepProgress = this.getOrderProgress(stepKey);
    return progress >= stepProgress && progress >= 0;
  }

  isStepCurrent(status: string, stepKey: string | undefined): boolean {
    if (!stepKey) return false;
    return status === stepKey;
  }

  openOrderDetail(order: any) {
    this.selectedOrder = order;
    this.selectedOrderProducts = [];
    this.drawerOpen = true;
    this.drawerLoading = true;

    const productIds: string[] = order.products || [];
    if (productIds.length === 0) {
      this.drawerLoading = false;
      return;
    }

    const requests = productIds.map((id: string) =>
      this.http.get<any>(`/api/products/${id}`).pipe(catchError(() => of(null)))
    );

    forkJoin(requests).subscribe({
      next: (products: any[]) => {
        this.selectedOrderProducts = products.filter(p => p !== null);
        this.drawerLoading = false;
      },
      error: () => {
        this.drawerLoading = false;
      }
    });
  }

  closeDrawer() {
    this.drawerOpen = false;
    setTimeout(() => {
      this.selectedOrder = null;
      this.selectedOrderProducts = [];
    }, 350);
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    this.http.get<any>('/api/users/user/user',
      { withCredentials: true }).subscribe({
      next: (res) => {
        this.user = res.data;
        this.loadOrders(this.user._id);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  loadOrders(userId: string) {
    this.http.get<any>(`/api/users/${userId}/orders`,
      { withCredentials: true }).subscribe({
      next: (res) => {
        this.orders = res.orders || res || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.http.post('/api/users/user/logout', {},
      { withCredentials: true }).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }

  navigateTo(section: 'dashboard' | 'orders' | 'profile') {
    this.activeSection = section;
    this.mobileSidebarOpen = false;
  }
}
