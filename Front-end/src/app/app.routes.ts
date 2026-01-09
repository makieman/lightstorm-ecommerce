import { Routes } from '@angular/router';
import { HomeComponent } from './features/shop/pages/home/home.component';
import { ItemComponent } from './features/shop/pages/item/item.component';
import { AboutComponent } from './shared/components/about/about.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { CartComponent } from './features/shop/pages/cart/cart.component';
import { CheckoutComponent } from './features/shop/pages/checkout/checkout.component';
import { AdminComponent } from './features/admin/admin/admin.component';
import { ProductsComponent } from './features/shop/pages/products/products.component';
import { ProfileComponent } from './features/auth/pages/profile/profile.component';
import { SingleProductDetailsComponent } from './features/shop/pages/single-product-details/single-product-details.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { PaymentComponent } from './features/shop/pages/payment/payment.component';
import { ConfirmOrderComponent } from './features/shop/pages/confirm-order/confirm-order.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { AllProductsGuard } from './core/guards/all-products.guard';
import { UsersComponent } from './features/admin/components/users/users.component';
import { ProductlistComponent } from './features/admin/components/productlist/productlist.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'product/:id',
    component: SingleProductDetailsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent, canActivate: [AuthGuard] },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'admin/users', component: UsersComponent, canActivate: [AdminGuard] },
  {
    path: 'admin/product',
    component: ProductlistComponent,
    canActivate: [AdminGuard],
  },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [AllProductsGuard],
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentComponent },
  { path: 'confirm', component: ConfirmOrderComponent },
  { path: '**', redirectTo: '/home' },
];
