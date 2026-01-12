import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../../features/shop/pages/products/product.model';

@Injectable({
    providedIn: 'root'
})
export class CoreProductService {
    private apiUrl = '/api/products';

    constructor(private http: HttpClient) { }

    // Get all products
    getAllProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    // Get first four products for home page
    getFourProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl);
    }

    // Get product by ID
    getProductById(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    // Create new product
    createProduct(product: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, product);
    }

    // Update product
    updateProduct(product: any): Observable<any> {
        const id = product.get('_id') || product._id;
        return this.http.put<any>(`${this.apiUrl}/${id}`, product);
    }

    // Delete product
    deleteProduct(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // Get user by token (used for cart/auth related product actions)
    getUserToken(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/user/product/token`, { withCredentials: true });
    }

    // Add product to cart
    addProductToCart(user_id: string, product: string, quantity: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/product/addtocart`, { user_id, product, quantity });
    }

    // Add product review
    addReview(id: string, review: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/reviews`, review);
    }

    // Get order by ID
    getOrderById(id: any): Observable<any> {
        return this.http.get(`/api/orders/${id}`);
    }
}
