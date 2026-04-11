import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { SigninComponent } from './pages/auth/signin/signin';
import { SignupComponent } from './pages/auth/signup/signup';
import { FashionComponent } from './pages/category/fashion/fashion';
import { MobilesComponent } from './pages/category/mobiles/mobiles';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: 'auth/signup', component: SignupComponent },
  { path: 'category/fashion', component: FashionComponent },
  { path: 'category/mobiles', component: MobilesComponent },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];
