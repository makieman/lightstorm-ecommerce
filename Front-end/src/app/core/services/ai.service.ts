import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = '/api/ai'; // Adjust to your backend URL

  constructor(private http: HttpClient) {}

  /**
   * Generate product description using AI
   * @param productName - Name of the product
   * @param category - Product category
   * @returns Observable with generated description
   */
  generateDescription(productName: string, category: string): Observable<{ success: boolean; description?: string; error?: string }> {
    return this.http.post<{ success: boolean; description?: string; error?: string }>(
      `${this.apiUrl}/generate-description`,
      { productName, category }
    ).pipe(
      catchError(error => {
        console.error('AI Service Error:', error);
        return of({ success: false, error: 'Failed to generate description. Please try again.' });
      })
    );
  }
}
