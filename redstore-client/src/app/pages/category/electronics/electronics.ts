import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-electronics',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './electronics.html',
  styleUrls: ['./electronics.scss']
})
export class ElectronicsComponent {
  
  constructor() {}

  // Electronics category data from centralized data
  categoryName = CATEGORIES_DATA['electronics'].name;
  categoryDescription = CATEGORIES_DATA['electronics'].description;
  categoryIcon = CATEGORIES_DATA['electronics'].icon;
}
