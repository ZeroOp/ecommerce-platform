import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-toys',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './toys.html',
  styleUrls: ['./toys.scss']
})
export class ToysComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['toys'].name;
  categoryDescription = CATEGORIES_DATA['toys'].description;
  categoryIcon = CATEGORIES_DATA['toys'].icon;
}
