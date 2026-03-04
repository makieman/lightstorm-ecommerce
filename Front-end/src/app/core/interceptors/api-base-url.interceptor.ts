import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

// Hardcoded production backend — used when the environment file doesn't inject the URL
const RENDER_BACKEND_URL = 'https://lightstorm-ecommerce.onrender.com';

/**
 * Intercepts HTTP requests and prepends the backend URL to any /api request.
 * In development (localhost), the Angular proxy handles routing.
 * In production (Vercel), requests are forwarded directly to the Render backend.
 */
export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    if (req.url.startsWith('/api')) {
        // Get the base URL from environment OR detect production via hostname
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        const baseUrl = environment.apiBaseUrl || (!isLocalhost ? RENDER_BACKEND_URL : '');

        if (baseUrl) {
            const apiReq = req.clone({
                url: `${baseUrl}${req.url}`,
                withCredentials: true
            });
            return next(apiReq);
        }
    }
    return next(req);
};
