import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardLayoutComponent, DashNavItem } from '../dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'rs-seller-layout',
  standalone: true,
  imports: [DashboardLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-dashboard-layout
      [nav]="nav"
      contextLabel="Seller Hub"
      contextSub="Nova Essentials"
      accent="linear-gradient(135deg, #10b981, #059669)">
    </rs-dashboard-layout>
  `,
})
export class SellerLayoutComponent {
  nav: DashNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/seller', exact: true },
    { label: 'Products',  icon: 'box',       route: '/seller/products' },
    { label: 'Inventory', icon: 'package',   route: '/seller/inventory' },
    { label: 'Brands',    icon: 'tag',       route: '/seller/brands' },
    { label: 'Deals',     icon: 'sparkle',   route: '/seller/deals' },
    { label: 'Orders',    icon: 'truck',     route: '/seller/orders' },
    { label: 'Analytics', icon: 'chart',     route: '/seller/analytics' },
    { label: 'Settings',  icon: 'settings',  route: '/seller/settings' },
  ];
}
