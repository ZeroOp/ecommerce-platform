import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardLayoutComponent, DashNavItem } from '../dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'rs-admin-layout',
  standalone: true,
  imports: [DashboardLayoutComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <rs-dashboard-layout
      [nav]="nav"
      contextLabel="Admin Console"
      contextSub="RedStore Platform"
      accent="linear-gradient(135deg, #f43f5e, #be123c)">
    </rs-dashboard-layout>
  `,
})
export class AdminLayoutComponent {
  nav: DashNavItem[] = [
    { label: 'Overview',  icon: 'dashboard', route: '/admin', exact: true },
    { label: 'Users',     icon: 'users',     route: '/admin/users' },
  { label: 'Sellers',   icon: 'shield',    route: '/admin/sellers' },
  { label: 'Brands',    icon: 'tag',       route: '/admin/brands' },
  { label: 'Products',  icon: 'box',       route: '/admin/products' },
    { label: 'Categories', icon: 'package',   route: '/admin/categories' },
    { label: 'Orders',    icon: 'truck',     route: '/admin/orders' },
    { label: 'Analytics', icon: 'chart',     route: '/admin/analytics' },
    { label: 'Settings',  icon: 'settings',  route: '/admin/settings' },
  ];
}
