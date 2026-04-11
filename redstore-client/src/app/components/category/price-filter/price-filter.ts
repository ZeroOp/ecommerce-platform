import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PriceRange } from '../../../data/category.data';

@Component({
  selector: 'app-price-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './price-filter.html',
  styleUrls: ['./price-filter.scss']
})
export class PriceFilterComponent {
  @Input() priceRanges: PriceRange[] = [];
  @Input() categoryId: string = '';
  @Input() selectedRange?: PriceRange;
  @Output() rangeSelected = new EventEmitter<PriceRange>();

  constructor(private router: Router) {}

  selectRange(range: PriceRange) {
    this.selectedRange = range;
    this.rangeSelected.emit(range);
    this.router.navigate(['/products', this.categoryId], { 
      queryParams: { 
        minPrice: range.min, 
        maxPrice: range.max 
      } 
    });
  }

  isActive(range: PriceRange): boolean {
    return this.selectedRange?.id === range.id;
  }
}
