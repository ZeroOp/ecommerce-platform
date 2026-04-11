import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-fashion',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './fashion.html',
  styleUrls: ['./fashion.scss']
})
export class FashionComponent {
  
  constructor() {}

  // Fashion category data from centralized data
  categoryName = CATEGORIES_DATA['fashion'].name;
  categoryDescription = CATEGORIES_DATA['fashion'].description;
  categoryIcon = CATEGORIES_DATA['fashion'].icon;
}
