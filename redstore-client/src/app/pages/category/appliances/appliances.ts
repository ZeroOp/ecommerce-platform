import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';
import { CATEGORIES_DATA } from '../../../data/category.data';

@Component({
  selector: 'app-appliances',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './appliances.html',
  styleUrls: ['./appliances.scss']
})
export class AppliancesComponent {
  
  constructor() {}

  categoryName = CATEGORIES_DATA['appliances'].name;
  categoryDescription = CATEGORIES_DATA['appliances'].description;
  categoryIcon = CATEGORIES_DATA['appliances'].icon;
}
