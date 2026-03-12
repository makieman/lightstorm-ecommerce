import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Intercepts HTTP requests and prepends the backend base URL to any /api request.
 * - Dev (localhost): apiBaseUrl is empty — Angular proxy (proxy.conf.json) handles routing.
 * - Prod (Vercel):   apiBaseUrl is empty — Vercel rewrite proxies /api/* to Render.
 *   This keeps cookies same-origin (vercel.app), eliminating cross-origin cookie issues.
 * withCredentials is always added so cookies are sent on every API request.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.startsWith('/api')) {
        const apiReq = req.clone({
            url: environment.apiBaseUrl ? `${environment.apiBaseUrl}${req.url}` : req.url,
            withCredentials: true
        });
        return next(apiReq);
    }
    return next(req);
};
