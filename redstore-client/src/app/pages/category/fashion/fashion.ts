import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';

@Component({
  selector: 'app-fashion',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './fashion.html',
  styleUrls: ['./fashion.scss']
})
export class FashionComponent implements OnInit {

  constructor() {}

  ngOnInit() {}
}
