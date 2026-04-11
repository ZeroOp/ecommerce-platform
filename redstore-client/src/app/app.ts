import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { CategoryTabsComponent } from './components/category-tabs/category-tabs';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent, CategoryTabsComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check if user is already logged in on app initialization
    this.authService.getCurrentUser().subscribe({
      error: (error) => {
        // Handle connection errors gracefully - assume user is not logged in
        console.log('Backend not available - no active session found');
      }
    });
  }
}
