import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-sports',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './sports.html',
  styleUrls: ['./sports.scss']
})
export class SportsComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['sports'].name;
  categoryDescription = CATEGORIES_DATA['sports'].description;
  categoryIcon = CATEGORIES_DATA['sports'].icon;
}
