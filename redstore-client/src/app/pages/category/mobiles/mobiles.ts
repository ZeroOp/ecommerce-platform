import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-mobiles',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './mobiles.html',
  styleUrls: ['./mobiles.scss']
})
export class MobilesComponent {
  
  constructor() {}

  // Mobiles category data from centralized data
  categoryName = CATEGORIES_DATA['mobiles'].name;
  categoryDescription = CATEGORIES_DATA['mobiles'].description;
  categoryIcon = CATEGORIES_DATA['mobiles'].icon;
}
