import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Banner {
  _id: string;
  title: string;
  subtitle: string;
  discount: number;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  bgColor: string;
  linkedProducts: any[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BannerService {
  private apiUrl = `${environment.apiBaseUrl}/api/banners`;

  constructor(private http: HttpClient) {}

  getActiveBanner(): Observable<{ success: boolean; banner: Banner | null }> {
    return this.http.get<any>(`${this.apiUrl}/active`);
  }

  getAllBanners(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { withCredentials: true });
  }

  createBanner(data: Partial<Banner>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { withCredentials: true });
  }

  updateBanner(id: string, data: Partial<Banner>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  toggleBanner(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle`, {}, { withCredentials: true });
  }

  deleteBanner(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
