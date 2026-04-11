import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-furniture',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './furniture.html',
  styleUrls: ['./furniture.scss']
})
export class FurnitureComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['furniture'].name;
  categoryDescription = CATEGORIES_DATA['furniture'].description;
  categoryIcon = CATEGORIES_DATA['furniture'].icon;
}
