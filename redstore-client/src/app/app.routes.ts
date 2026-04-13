import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SigninComponent } from './pages/auth/signin/signin';
import { UserSigninComponent } from './pages/auth/user-signin/user-signin';
import { SignupComponent } from './pages/auth/signup/signup';
import { SellerSigninComponent } from './pages/auth/seller-signin/seller-signin';
import { AdminSigninComponent } from './pages/auth/admin-signin/admin-signin';
import { RequestSellerComponent } from './pages/auth/request-seller/request-seller';
import { FashionComponent } from './pages/category/fashion/fashion';
import { MobilesComponent } from './pages/category/mobiles/mobiles';
import { ElectronicsComponent } from './pages/category/electronics/electronics';
import { AppliancesComponent } from './pages/category/appliances/appliances';
import { SportsComponent } from './pages/category/sports/sports';
import { BooksComponent } from './pages/category/books/books';
import { FurnitureComponent } from './pages/category/furniture/furniture';
import { BeautyComponent } from './pages/category/beauty/beauty';
import { ToysComponent } from './pages/category/toys/toys';
import { SellerDashboardComponent } from './pages/seller/seller-dashboard/seller-dashboard';
import { SellerProductsComponent } from './pages/seller/seller-products/seller-products';
import { SellerOrdersComponent } from './pages/seller/seller-orders/seller-orders';
import { SellerAnalyticsComponent } from './pages/seller/seller-analytics/seller-analytics';
import { SellerBrandsComponent } from './pages/seller/seller-brands/seller-brands';
import { SellerSettingsComponent } from './pages/seller/seller-settings/seller-settings';
import { SellerLayoutComponent } from './layouts/seller-layout/seller-layout';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard';
import { AuthGuard } from './guards/auth.guard.service';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/signin', component: UserSigninComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/seller-signin', component: SellerSigninComponent },
  { path: 'auth/admin-signin', component: AdminSigninComponent },
  { path: 'auth/request-seller', component: RequestSellerComponent },
  { path: 'category/fashion', component: FashionComponent },
  { path: 'category/mobiles', component: MobilesComponent },
  { path: 'category/electronics', component: ElectronicsComponent },
  { path: 'category/appliances', component: AppliancesComponent },
  { path: 'category/sports', component: SportsComponent },
  { path: 'category/books', component: BooksComponent },
  { path: 'category/furniture', component: FurnitureComponent },
  { path: 'category/beauty', component: BeautyComponent },
  { path: 'category/toys', component: ToysComponent },
  { 
    path: 'seller', 
    component: SellerLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'seller' },
    children: [
      { path: '', component: SellerDashboardComponent },
      { path: 'products', component: SellerProductsComponent },
      { path: 'brands', component: SellerBrandsComponent },
      { path: 'orders', component: SellerOrdersComponent },
      { path: 'analytics', component: SellerAnalyticsComponent },
      { path: 'settings', component: SellerSettingsComponent }
    ]
  },
  { 
    path: 'admin', 
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'users', component: AdminDashboardComponent },
      { path: 'products', component: AdminDashboardComponent },
      { path: 'orders', component: AdminDashboardComponent },
      { path: 'sellers', component: AdminDashboardComponent },
      { path: 'analytics', component: AdminDashboardComponent },
      { path: 'settings', component: AdminDashboardComponent }
    ]
  },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];
