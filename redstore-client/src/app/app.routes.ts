import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SigninComponent } from './pages/auth/signin/signin';
import { SignupComponent } from './pages/auth/signup/signup';
import { FashionComponent } from './pages/category/fashion/fashion';
import { MobilesComponent } from './pages/category/mobiles/mobiles';
import { ElectronicsComponent } from './pages/category/electronics/electronics';
import { AppliancesComponent } from './pages/category/appliances/appliances';
import { SportsComponent } from './pages/category/sports/sports';
import { BooksComponent } from './pages/category/books/books';
import { FurnitureComponent } from './pages/category/furniture/furniture';
import { BeautyComponent } from './pages/category/beauty/beauty';
import { ToysComponent } from './pages/category/toys/toys';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'category/fashion', component: FashionComponent },
  { path: 'category/mobiles', component: MobilesComponent },
  { path: 'category/electronics', component: ElectronicsComponent },
  { path: 'category/appliances', component: AppliancesComponent },
  { path: 'category/sports', component: SportsComponent },
  { path: 'category/books', component: BooksComponent },
  { path: 'category/furniture', component: FurnitureComponent },
  { path: 'category/beauty', component: BeautyComponent },
  { path: 'category/toys', component: ToysComponent },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];
