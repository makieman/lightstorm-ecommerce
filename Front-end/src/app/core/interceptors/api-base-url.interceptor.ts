import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Intercepts HTTP requests and prepends the environment API base URL
 * to any request starting with '/api/'. In development, apiBaseUrl is empty
 * so the Angular proxy handles routing. In production, it prepends the
 * Render backend domain (e.g. https://lightstorm-api.onrender.com).
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    if (environment.apiBaseUrl && req.url.startsWith('/api')) {
        const apiReq = req.clone({
            url: `${environment.apiBaseUrl}${req.url}`,
            withCredentials: true
        });
        return next(apiReq);
    }
    return next(req);
};
