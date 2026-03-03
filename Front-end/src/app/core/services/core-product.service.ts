import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, GroupedProducts, Category } from '../../features/shop/pages/products/product.model';

@Injectable({
    providedIn: 'root'
})
export class CoreProductService {
    private apiUrl = '/api/products';
    private adminUrl = '/api/admin';

    constructor(private http: HttpClient) { }

    // Get all products
    getAllProducts(params?: any): Observable<any> {
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(key => {
                // Only add the parameter if it has a defined, non-null, non-empty-string value
                if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                    httpParams = httpParams.set(key, params[key]);
                }
            });
        }
        // The response is now an object { products: [], pagination: {} }, so we use <any>
        return this.http.get<any>(this.apiUrl, { params: httpParams });
    }

    // Get first four products for home page
    getFourProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/featured`);
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

    // ===================== Admin Endpoints =====================

    // Get products grouped by category (admin)
    getGroupedProducts(): Observable<GroupedProducts[]> {
        return this.http.get<GroupedProducts[]>(`${this.adminUrl}/products/grouped`, { withCredentials: true });
    }

    // Update product stock (admin)
    updateStock(productId: string, stockQuantity: number): Observable<any> {
        return this.http.patch(`${this.adminUrl}/products/${productId}/stock`, { stockQuantity }, { withCredentials: true });
    }

    // Get all categories (admin)
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.adminUrl}/categories`, { withCredentials: true });
    }

    // Create a new category (admin)
    createCategory(name: string, description?: string): Observable<Category> {
        return this.http.post<Category>(`${this.adminUrl}/categories`, { name, description }, { withCredentials: true });
    }
}

