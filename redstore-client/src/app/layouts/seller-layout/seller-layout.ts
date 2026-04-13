import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SellerHeaderComponent } from '../../components/headers/seller-header/seller-header';
import { SellerFooterComponent } from '../../components/footers/seller-footer/seller-footer';

@Component({
  selector: 'app-seller-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SellerHeaderComponent, SellerFooterComponent],
  templateUrl: './seller-layout.html',
  styleUrls: ['./seller-layout.scss']
})
export class SellerLayoutComponent {}
