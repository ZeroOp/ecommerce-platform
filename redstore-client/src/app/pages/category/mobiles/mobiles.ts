import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseCategoryComponent } from '../base-category';

@Component({
  selector: 'app-mobiles',
  standalone: true,
  imports: [CommonModule, BaseCategoryComponent],
  templateUrl: './mobiles.html',
  styleUrls: ['./mobiles.scss']
})
export class MobilesComponent implements OnInit {

  constructor() {}

  ngOnInit() {}
}
