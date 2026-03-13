import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreProductService } from '@app/core/services/core-product.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product-dialog.component.html',
  styleUrl: './edit-product-dialog.component.css',
})
export class EditProductDialogComponent {
  imageFile: File | null = null;
  selectedImages: { file: File; preview: string }[] = [];
  productUpdated: any;
  editForm = new FormGroup({
    title: new FormControl(''),
    price: new FormControl(''),
    details: new FormControl(''),
    productQuantity: new FormControl(''),
    poductCategory: new FormControl(''),
    wattage: new FormControl(''),
    voltage: new FormControl(''),
    batteryType: new FormControl(''),
    image: new FormControl(''),
  });
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: CoreProductService,
    protected dialog: MatDialogRef<any>,
    private router: Router
  ) {
    this.product = data.productFromParent;

    // Set default values for form controls based on product data
    this.editForm.patchValue({
      title: this.product.title,
      price: this.product.price,
      details: this.product.details,
      productQuantity: this.product.quantity,
      poductCategory: this.product.category,
      wattage: this.product.wattage,
      voltage: this.product.voltage,
      batteryType: this.product.batteryType,
    });
  }
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files as FileList).slice(0, 5); // Limit to 5 images
      this.selectedImages = (files as File[]).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      // Set first image as legacy single image for backward compatibility
      if (this.selectedImages.length > 0) {
        this.imageFile = this.selectedImages[0].file;
      }
    }
  }

  removeImage(index: number): void {
    URL.revokeObjectURL(this.selectedImages[index].preview);
    this.selectedImages.splice(index, 1);
    if (this.selectedImages.length === 0) {
      this.imageFile = null;
    } else if (index === 0) {
      this.imageFile = this.selectedImages[0].file;
    }
  }

  product = this.data.productFromParent;

  editFormSubmit() {
    this.productUpdated = new FormData();
    this.productUpdated.append('_id', this.product._id);
    this.productUpdated.append('title', this.editForm.value.title);
    this.productUpdated.append('price', this.editForm.value.price);
    this.productUpdated.append('details', this.editForm.value.details);
    this.productUpdated.append('quantity', this.editForm.value.productQuantity);
    this.productUpdated.append('category', this.editForm.value.poductCategory);
    this.productUpdated.append('wattage', this.editForm.value.wattage);
    this.productUpdated.append('voltage', this.editForm.value.voltage);
    this.productUpdated.append('batteryType', this.editForm.value.batteryType);
    
    // Append all selected images (up to 5)
    this.selectedImages.forEach((img, index) => {
      this.productUpdated.append('images', img.file);
    });
    // For backward compatibility with single image field
    if (this.imageFile && this.selectedImages.length === 0) {
      this.productUpdated.append('image', this.imageFile);
    }
    
    this.productService.updateProduct(this.productUpdated).subscribe(
      (data: any) => {
        console.log(data);
        this.dialog.close();
        Swal.fire({
          icon: 'success',
          title: 'Your Product Updated successfully',
        }).then(() => {
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['/admin/product']);
            });
        });
      },
      (error: any) => {
        // Explicitly specify the type of 'error' as 'any'
        console.log(error);
      }
    );
  }
  show() {
    console.log(this.product);
  }
}
