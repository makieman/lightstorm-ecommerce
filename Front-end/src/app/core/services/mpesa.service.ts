import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, switchMap, takeWhile, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MpesaService {
  constructor(private http: HttpClient) {}

  initiateSTKPush(phone: string, amount: number, orderId: string): Observable<any> {
    return this.http.post('/api/payments/stkpush', {
      phone, amount, orderId
    }, { withCredentials: true });
  }

  checkPaymentStatus(checkoutRequestId: string): Observable<any> {
    return this.http.get(
      `/api/payments/status/${checkoutRequestId}`,
      { withCredentials: true }
    );
  }

  // Poll every 3 seconds, max 10 times (30 seconds)
  pollPaymentStatus(checkoutRequestId: string): Observable<any> {
    return interval(3000).pipe(
      take(10),
      switchMap(() => this.checkPaymentStatus(checkoutRequestId)),
      takeWhile(
        (res) => res.status === 'pending',
        true
      )
    );
  }
}
