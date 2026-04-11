import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './books.html',
  styleUrls: ['./books.scss']
})
export class BooksComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['books'].name;
  categoryDescription = CATEGORIES_DATA['books'].description;
  categoryIcon = CATEGORIES_DATA['books'].icon;
}
