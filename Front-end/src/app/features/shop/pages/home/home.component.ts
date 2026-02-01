import { Component } from '@angular/core';
import { BannerComponent } from './components/banner/banner.component';
import { ProductComponent } from './components/product/product.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    BannerComponent,
    ProductComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
