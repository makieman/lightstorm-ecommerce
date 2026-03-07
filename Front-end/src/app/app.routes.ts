import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/shop/pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/shop/pages/single-product-details/single-product-details.component').then((m) => m.SingleProductDetailsComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./shared/components/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/pages/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/shop/pages/cart/cart.component').then((m) => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/shop/pages/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/components/dashboard/dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/components/users/users.component').then((m) => m.UsersComponent)
      },
      {
        path: 'product',
        loadComponent: () => import('./features/admin/components/productlist/productlist.component').then((m) => m.ProductlistComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/components/orders/orders.component').then((m) => m.OrdersComponent)
      },
    ]
  },
  {
    path: 'products',
    loadComponent: () => import('./features/shop/pages/products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/auth/pages/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'payment',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/shop/pages/payment/payment.component').then((m) => m.PaymentComponent)
  },
  {
    path: 'confirm',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/shop/pages/confirm-order/confirm-order.component').then((m) => m.ConfirmOrderComponent)
  },
  { path: '**', redirectTo: '/home' },
];
