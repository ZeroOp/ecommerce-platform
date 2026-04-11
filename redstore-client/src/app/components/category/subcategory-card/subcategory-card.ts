import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SubCategory } from '../../../data/category.data';

@Component({
  selector: 'app-subcategory-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subcategory-card.html',
  styleUrls: ['./subcategory-card.scss']
})
export class SubcategoryCardComponent {
  @Input() subcategory: SubCategory | null = null;
  @Input() categoryId: string = '';

  constructor(private router: Router) {}

  navigateToProducts() {
    if (this.subcategory && this.categoryId) {
      this.router.navigate(['/products', this.categoryId, this.subcategory.id]);
    }
  }
}
