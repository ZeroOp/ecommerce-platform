import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-beauty',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './beauty.html',
  styleUrls: ['./beauty.scss']
})
export class BeautyComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['beauty'].name;
  categoryDescription = CATEGORIES_DATA['beauty'].description;
  categoryIcon = CATEGORIES_DATA['beauty'].icon;
}
