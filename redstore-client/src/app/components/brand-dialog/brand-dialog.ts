import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brand-dialog.html',
  styleUrls: ['./brand-dialog.scss']
})
export class BrandDialogComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  
  brandData = {
    name: '',
    website: '',
    logo: null as File | null,
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    establishedYear: ''
  };

  openDialog() {
    console.log('BrandDialog: openDialog called');
    this.isOpen = true;
    console.log('BrandDialog: isOpen set to', this.isOpen);
  }

  closeDialog() {
    this.isOpen = false;
    this.close.emit();
    this.resetForm();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.brandData.logo = input.files[0];
    }
  }

  removeLogo() {
    this.brandData.logo = null;
  }

  submitBrand() {
    if (this.validateForm()) {
      console.log('Brand data submitted:', this.brandData);
      // TODO: Add API call to submit brand
      this.closeDialog();
    }
  }

  validateForm(): boolean {
    return !!(this.brandData.name && 
             this.brandData.website && 
             this.brandData.logo && 
             this.brandData.contactEmail);
  }

  resetForm() {
    this.brandData = {
      name: '',
      website: '',
      logo: null,
      description: '',
      category: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      establishedYear: ''
    };
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }
}
