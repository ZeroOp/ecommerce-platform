import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { HomeComponent } from './features/home/home.component';
import { CategoryComponent } from './features/category/category.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrdersComponent } from './features/orders/orders.component';
import { ProfileComponent } from './features/profile/profile.component';
import { DealsComponent } from './features/deals/deals.component';
import { NotFoundComponent } from './features/not-found/not-found.component';

import { SigninComponent } from './features/auth/signin.component';
import { SignupComponent } from './features/auth/signup.component';
import { SellerSigninComponent } from './features/auth/seller-signin.component';
import { AdminSigninComponent } from './features/auth/admin-signin.component';
import { RequestSellerComponent } from './features/auth/request-seller.component';

import { SellerDashboardComponent } from './features/seller/seller-dashboard.component';
import { SellerProductsComponent } from './features/seller/seller-products.component';
import { SellerBrandsComponent } from './features/seller/seller-brands.component';
import { SellerOrdersComponent } from './features/seller/seller-orders.component';
import { SellerAnalyticsComponent } from './features/seller/seller-analytics.component';
import { SellerSettingsComponent } from './features/seller/seller-settings.component';

import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminUsersComponent } from './features/admin/admin-users.component';
import { AdminSellersComponent } from './features/admin/admin-sellers.component';
import { AdminBrandsComponent } from './features/admin/admin-brands.component';
import { AdminProductsComponent } from './features/admin/admin-products.component';
import { AdminCategoriesComponent } from './features/admin/admin-categories.component';
import { AdminOrdersComponent } from './features/admin/admin-orders.component';
import { AdminAnalyticsComponent } from './features/admin/admin-analytics.component';
import { AdminSettingsComponent } from './features/admin/admin-settings.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public storefront
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'RedStore — Modern Marketplace' },
      { path: 'category/:slug', component: CategoryComponent },
      { path: 'product/:id',    component: ProductDetailComponent },
      { path: 'cart',           component: CartComponent,     title: 'Your cart · RedStore' },
      { path: 'checkout',       component: CheckoutComponent, title: 'Checkout · RedStore' },
      { path: 'orders',         component: OrdersComponent,   title: 'My orders · RedStore' },
      { path: 'profile',        component: ProfileComponent,  title: 'Profile · RedStore' },
      { path: 'deals',          component: DealsComponent,    title: 'Deals · RedStore' },
    ],
  },

  // Auth
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'signin',         component: SigninComponent,        title: 'Sign in · RedStore' },
      { path: 'signup',         component: SignupComponent,        title: 'Sign up · RedStore' },
      { path: 'seller-signin',  component: SellerSigninComponent,  title: 'Seller sign in · RedStore' },
      { path: 'admin-signin',   component: AdminSigninComponent,   title: 'Admin sign in · RedStore' },
      { path: 'request-seller', component: RequestSellerComponent, title: 'Become a seller · RedStore' },
    ],
  },

  // Seller Hub
  {
    path: 'seller',
    component: SellerLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    data: { role: 'seller' },
    children: [
      { path: '',          component: SellerDashboardComponent, title: 'Seller Hub · RedStore' },
      { path: 'products',  component: SellerProductsComponent,  title: 'Products · Seller Hub' },
      { path: 'brands',    component: SellerBrandsComponent,    title: 'Brands · Seller Hub' },
      { path: 'orders',    component: SellerOrdersComponent,    title: 'Orders · Seller Hub' },
      { path: 'analytics', component: SellerAnalyticsComponent, title: 'Analytics · Seller Hub' },
      { path: 'settings',  component: SellerSettingsComponent,  title: 'Settings · Seller Hub' },
    ],
  },

  // Admin Console
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    data: { role: 'admin' },
    children: [
      { path: '',          component: AdminDashboardComponent, title: 'Admin Console · RedStore' },
      { path: 'users',     component: AdminUsersComponent,     title: 'Users · Admin' },
      { path: 'sellers',   component: AdminSellersComponent,   title: 'Sellers · Admin' },
      { path: 'brands',    component: AdminBrandsComponent,    title: 'Brands · Admin' },
      { path: 'products',  component: AdminProductsComponent,  title: 'Products · Admin' },
      { path: 'categories', component: AdminCategoriesComponent, title: 'Categories · Admin' },
      { path: 'orders',    component: AdminOrdersComponent,    title: 'Orders · Admin' },
      { path: 'analytics', component: AdminAnalyticsComponent, title: 'Analytics · Admin' },
      { path: 'settings',  component: AdminSettingsComponent,  title: 'Settings · Admin' },
    ],
  },

  { path: '**', component: NotFoundComponent, title: 'Not found · RedStore' },
];
