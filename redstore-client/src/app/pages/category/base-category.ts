import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-base-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-category.html',
  styleUrls: ['./base-category.scss']
})
export class BaseCategoryComponent implements OnInit {
  @Input() categoryName: string = '';
  @Input() categoryDescription: string = '';
  @Input() categoryIcon: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get category name from route if not provided as input
    if (!this.categoryName) {
      this.route.paramMap.subscribe(params => {
        this.categoryName = params.get('name') || 'Category';
      });
    }
  }
}
