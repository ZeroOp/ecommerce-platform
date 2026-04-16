import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-dialog.html',
  styleUrls: ['./product-dialog.scss']
})
export class ProductDialogComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  productData = {
    name: '',
    brand: '',
    category: '',
    price: '',
    stock: '',
    sku: '',
    description: '',
    images: [] as File[],
    tags: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    }
  };

  categories = [
    'Electronics',
    'Fashion & Apparel',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Personal Care',
    'Toys & Games',
    'Books & Media',
    'Automotive',
    'Food & Beverages',
    'Health & Wellness',
    'Other'
  ];

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      
      // Check if adding these files would exceed the 5 image limit
      if (this.productData.images.length + newFiles.length > 5) {
        alert('Maximum 5 images allowed. Please select fewer images.');
        return;
      }
      
      // Process each file with pre-signed URL
      for (const file of newFiles) {
        try {
          const uploadedUrl = await this.uploadImageWithPresignedUrl(file);
          // For now, we'll store the file locally, but in production this would be the URL
          this.productData.images.push(file);
          console.log('Image uploaded successfully:', uploadedUrl);
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Please try again.');
        }
      }
      
      // Clear the input to allow re-selecting the same files
      input.value = '';
    }
  }

  async uploadImageWithPresignedUrl(file: File): Promise<string> {
    try {
      // Simulate getting a pre-signed URL from your backend
      const presignedUrl = await this.getPresignedUrl(file.name, file.type);
      
      // Upload the file to the pre-signed URL
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      // Return the final URL (in production, this would be the actual file URL)
      return `https://your-storage-bucket.s3.amazonaws.com/products/${file.name}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async getPresignedUrl(fileName: string, fileType: string): Promise<string> {
    // In production, this would call your backend API to get a pre-signed URL
    // For now, we'll simulate this with a mock response
    
    console.log(`Requesting pre-signed URL for: ${fileName} (${fileType})`);
    
    // Mock API call - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock pre-signed URL
        const mockUrl = `https://your-storage-bucket.s3.amazonaws.com/upload/products/${fileName}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=mock`;
        resolve(mockUrl);
      }, 500);
    });
    
    // In production, this would be:
    // const response = await fetch('/api/upload/presigned-url', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ fileName, fileType })
    // });
    // const data = await response.json();
    // return data.url;
  }

  removeImage(index: number) {
    this.productData.images.splice(index, 1);
  }

  generateSKU() {
    const brandPrefix = this.productData.brand.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 10000);
    this.productData.sku = `${brandPrefix}-${randomNum}`;
  }

  closeDialog() {
    this.close.emit();
  }

  submitProduct() {
    if (this.validateForm()) {
      console.log('Product data submitted:', this.productData);
      this.close.emit();
      this.resetForm();
    }
  }

  validateForm(): boolean {
    return !!(this.productData.name && 
             this.productData.brand && 
             this.productData.category && 
             this.productData.price && 
             this.productData.stock);
  }

  resetForm() {
    this.productData = {
      name: '',
      brand: '',
      category: '',
      price: '',
      stock: '',
      sku: '',
      description: '',
      images: [],
      tags: '',
      weight: '',
      dimensions: {
        length: '',
        width: '',
        height: ''
      }
    };
  }

  createObjectURL(file: File): string {
    return URL.createObjectURL(file);
  }
}
