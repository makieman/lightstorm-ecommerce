# Lightstorm E-Commerce Project Structure

## 📁 Root Directory Structure

```
lightstorm/
├── Back-end/                    # Node.js/Express API server
├── Front-end/                   # Angular 17 client application
├── Middlewares/                 # Shared middleware (if any)
├── landing-page/               # Static marketing website
├── lightstorm-website/         # Alternative/legacy Angular project
├── UI_PROJECT_STRUCTURE_FOR_AI_AGENT.md  # UI documentation
└── package.json                # Root package configuration
```

---

## 🔧 Back-end Structure

```
Back-end/
├── src/
│   ├── Controllers/           # Route handlers
│   │   ├── order.controller.js     # Order CRUD operations
│   │   ├── product.controller.js   # Product CRUD operations
│   │   └── user.controller.js      # User authentication & management
│   │
│   ├── Models/               # Mongoose schemas
│   │   ├── order.model.js         # Order data structure
│   │   ├── product.model.js        # Product data structure
│   │   └── user.model.js           # User data structure
│   │
│   ├── Middlewares/         # Express middleware
│   │   ├── multer.js              # File upload handling (Cloudinary)
│   │   ├── order.validation.js    # Order validation schemas
│   │   └── product.validation.js  # Product validation schemas
│   │
│   ├── Routes/              # API route definitions
│   │   ├── order.routes.js        # Order endpoints
│   │   ├── product.routes.js      # Product endpoints
│   │   └── user.routes.js         # User endpoints
│   │
│   ├── Servers/             # Server configuration
│   │   └── server.js             # Express app setup
│   │
│   ├── services/            # Business logic services
│   │   └── cloudinary.service.js  # Cloudinary image upload
│   │
│   ├── config/              # Configuration files
│   │   └── env.js                # Environment variables
│   │
│   ├── app.js               # Main Express application
│   └── server.js            # Server entry point
│
├── create_admin.js          # Script to create admin user
├── solarize_db.js           # Database seed/migration script
├── package.json
└── .env                    # Environment variables (not in git)
```

### Backend API Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/api/products` | Get all products (with filtering, pagination) | Public |
| GET | `/api/products/featured` | Get 4 featured products | Public |
| GET | `/api/products/:id` | Get product by ID | Public |
| POST | `/api/products` | Create new product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/products/:id/reviews` | Add product review | User |
| GET | `/api/users/user/user` | Get current user | Cookie |
| POST | `/api/products/product/addtocart` | Add to cart | User |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| POST | `/api/users/login` | User login | Public |
| POST | `/api/users/register` | User registration | Public |
| GET | `/api/orders` | Get all orders | Admin |
| GET | `/api/orders/:id` | Get order by ID | User/Admin |
| PUT | `/api/orders/:id` | Update order status | Admin |

---

## 🎨 Front-end Structure

```
Front-end/
├── src/
│   ├── app/
│   │   ├── core/                   # Core functionality
│   │   │   ├── guards/             # Route guards
│   │   │   │   ├── admin.guard.ts      # Admin access control
│   │   │   │   ├── all-products.guard.ts # Product listing access
│   │   │   │   └── auth.guard.ts        # Authentication guard
│   │   │   │
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   │   └── cart.models.ts
│   │   │   │
│   │   │   └── services/           # API services
│   │   │       ├── cart-products-count.service.ts
│   │   │       ├── cart.service.ts
│   │   │       ├── core-product.service.ts
│   │   │       ├── home-product.service.ts
│   │   │       ├── order-service.service.ts
│   │   │       ├── single-product.service.ts
│   │   │       ├── user-service.service.ts
│   │   │       └── products.service.ts
│   │   │
│   │   ├── features/               # Feature modules
│   │   │   ├── admin/              # Admin dashboard
│   │   │   │   ├── admin/
│   │   │   │   │   ├── admin.component.ts/html/css
│   │   │   │   │   └── admin.component.spec.ts
│   │   │   │   └── components/
│   │   │   │       ├── productlist/     # Product management
│   │   │   │       │   ├── productlist.component.ts/html/css
│   │   │   │       │   └── productlist.component.spec.ts
│   │   │   │       └── users/          # User management
│   │   │   │           ├── users.component.ts/html/css
│   │   │   │           ├── view-user/
│   │   │   │           ├── edit-user/
│   │   │   │           └── create-user/
│   │   │   │
│   │   │   ├── auth/               # Authentication
│   │   │   │   └── pages/
│   │   │   │       ├── login/          # Login page
│   │   │   │       │   ├── login.component.ts/html/css
│   │   │   │       │   └── login.component.spec.ts
│   │   │   │       ├── register/       # Registration page
│   │   │   │       │   ├── register.component.ts/html/css
│   │   │   │       │   └── register.component.spec.ts
│   │   │   │       └── profile/        # User profile
│   │   │   │           ├── profile.component.ts/html/css
│   │   │   │           ├── user-picture/
│   │   │   │           ├── user-info/
│   │   │   │           ├── pending-orders/
│   │   │   │           ├── accepted-orders/
│   │   │   │           ├── rejected-orders/
│   │   │   │           └── order-dialog/
│   │   │   │
│   │   │   └── shop/               # E-commerce features
│   │   │       └── pages/
│   │   │           ├── home/                    # Home page
│   │   │           │   ├── home.component.ts/html/css
│   │   │           │   ├── home.component.spec.ts
│   │   │           │   ├── banner/
│   │   │           │   ├── chair/
│   │   │           │   ├── modern/
│   │   │           │   ├── cons/
│   │   │           │   ├── sale/
│   │   │           │   └── product/
│   │   │           ├── products/               # Product listing
│   │   │           │   ├── products.component.ts/html/css
│   │   │           │   ├── products.component.spec.ts
│   │   │           │   └── product.model.ts
│   │   │           ├── single-product-details/ # Product details
│   │   │           │   └── single-product-details.component.ts/html/css
│   │   │           ├── cart/                   # Shopping cart
│   │   │           │   └── cart.component.ts/html/css
│   │   │           ├── checkout/               # Checkout page
│   │   │           │   └── checkout.component.ts/html/css
│   │   │           ├── payment/                # Payment page
│   │   │           │   └── payment.component.ts/html/css
│   │   │           ├── confirm-order/          # Order confirmation
│   │   │           │   └── confirm-order.component.ts/html/css
│   │   │           └── item/                   # Single item view
│   │   │               └── item.component.ts/html/css
│   │   │
│   │   ├── shared/                 # Shared components
│   │   │   ├── components/
│   │   │   │   ├── header/          # Navigation header
│   │   │   │   │   ├── header.component.ts/html/css
│   │   │   │   ├── footer/          # Page footer
│   │   │   │   │   ├── footer.component.ts/html/css
│   │   │   │   └── about/           # About section
│   │   │   │       └── about.component.ts/html/css
│   │   │   ├── models/              # Shared interfaces
│   │   │   └── pipes/               # Custom Angular pipes
│   │   │
│   │   ├── app.component.ts/html/css    # Root component
│   │   ├── app.routes.ts                 # Route configuration
│   │   └── app.config.ts                 # App configuration
│   │
│   ├── assets/                      # Static assets
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── environments/                # Environment configs
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles.css                   # Global styles
│   ├── index.html                   # HTML entry point
│   └── main.ts                      # Application bootstrap
│
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json
├── proxy.conf.json                  # Dev proxy configuration
└── README.md
```

### Frontend Routes

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | Redirect → `/home` | - | Default route |
| `/home` | HomeComponent | - | Landing/home page |
| `/about` | AboutComponent | - | About page |
| `/login` | LoginComponent | - | User login |
| `/register` | RegisterComponent | - | User registration |
| `/products` | ProductsComponent | AllProductsGuard | Product catalog |
| `/product/:id` | SingleProductDetailsComponent | AuthGuard | Product details |
| `/cart` | CartComponent | AuthGuard | Shopping cart |
| `/checkout` | CheckoutComponent | AuthGuard | Checkout process |
| `/payment` | PaymentComponent | - | Payment page |
| `/confirm` | ConfirmOrderComponent | - | Order confirmation |
| `/profile` | ProfileComponent | AuthGuard | User profile |
| `/admin` | AdminComponent | AdminGuard | Admin dashboard |
| `/admin/product` | ProductlistComponent | AdminGuard | Product management |
| `/admin/users` | UsersComponent | AdminGuard | User management |
| `/**` | Redirect → `/home` | - | 404 fallback |

---

## 🌐 Landing Page Structure

```
landing-page/
├── index.html                  # Main landing page
├── assets/
│   ├── css/                   # Stylesheets
│   │   ├── bootstrap.min.css
│   │   ├── font-awesome.min.css
│   │   ├── elementor-*.css    # Elementor styles
│   │   ├── woocommerce*.css   # WooCommerce styles
│   │   ├── animations.css
│   │   └── style.css
│   │
│   ├── js/                    # JavaScript libraries
│   │   ├── jquery.min.js
│   │   ├── bootstrap.bundle.min.js
│   │   ├── gsap.min.js        # GSAP animations
│   │   ├── ScrollTrigger.min.js
│   │   ├── swiper-bundle.min.js
│   │   ├── apexcharts.min.js
│   │   ├── isotope.pkgd.min.js
│   │   ├── main.js            # Custom scripts
│   │   └── ...
│   │
│   ├── images/                # Images & media
│   │   └── 2024/              # Year-organized images
│   │
│   └── fonts/                 # Font files
│
└── ... (additional HTML pages)
```

---

## 🗄️ Database Models

### User Model (`user.model.js`)
```javascript
{
  username: String (required)
  email: String (unique, required)
  password: String (required)
  gender: 'male' | 'female'
  image: String (Cloudinary URL)
  isAdmin: Boolean (default: false)
  orders: [ObjectId] (references orders)
  carts: [{
    product: ObjectId (ref: products)
    quantity: Number
  }]
  timestamps: true
}
```

### Product Model (`product.model.js`)
```javascript
{
  title: String (required)
  price: Number (required)
  quantity: Number (min: 0, default: 0)
  type: 'product' | 'service' (default: 'product')
  details: String
  image: String (Cloudinary URL)
  category: String
  wattage: String
  voltage: String
  batteryType: String
  reviews: [{
    user_id: ObjectId (ref: users)
    name: String
    comment: String
    rating: Number
    date: Date
  }]
  timestamps: true
  text index: { title, details }
}
```

### Order Model (`order.model.js`)
```javascript
{
  userId: ObjectId (ref: users)
  username: String
  date: Date
  totalPrice: Number
  products: [ObjectId] (ref: products)
  status: String ('Pending', 'Confirmed', 'Rejected', etc.)
  timestamps: true
}
```

---

## 🔐 Authentication Flow

```
User Login
    ↓
POST /api/users/login
    ↓
Validate credentials (bcrypt)
    ↓
Generate JWT token (secret key)
    ↓
Set httpOnly cookie (30 days)
    ↓
Return user data
    ↓
AuthGuard intercepts requests
    ↓
Verifies JWT cookie
    ↓
Allows/Denies access based on role
```

---

## 🎨 Design System

### Colors
```css
--solar-green: #7cbb3b
--solar-lime: #B9D32A
--solar-dark-green: #219753
--solar-gradient: linear-gradient(-180deg, #d6df22 0%, #7cbb3b 30%, #219753 100%)
--solar-accent: #ffc107
```

### Fonts
- Primary: Inter, Roboto, Helvetica Neue, sans-serif
- Icons: Bootstrap Icons, Material Icons, PrimeIcons

---

## 🚀 Tech Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (httpOnly cookies)
- **File Storage**: Cloudinary
- **Validation**: AJV, custom middleware

### Frontend
- **Framework**: Angular 17.3+ (Standalone Components)
- **Language**: TypeScript 5.4
- **UI Libraries**: Bootstrap 5.3, Angular Material 17.3, PrimeNG 17.14
- **State Management**: Services (RxJS)
- **HTTP**: Angular HttpClient
- **Charts**: ApexCharts 3.54
- **Alerts**: SweetAlert2 11.6

### DevTools
- **Backend**: nodemon
- **Frontend**: Angular CLI 17.3
- **Build**: Webpack (via Angular CLI)
- **Package Manager**: npm

---

## 📝 Scripts

### Backend
```bash
npm start          # Start production server (port 7000)
npm run serve      # Start development server with nodemon
```

### Frontend
```bash
ng serve           # Start dev server (default port 4200)
ng build           # Production build
ng test            # Run tests
```

---

## 🔑 Environment Variables

Backend (`.env`):
```
PORT=7000
MONGODB_URI=mongodb://localhost:27017/lightstorm
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

---

## 📦 Key Dependencies

### Backend Dependencies
- express ^4.19.2
- mongoose ^8.3.2
- bcryptjs ^2.4.3
- jsonwebtoken ^9.0.2
- multer ^1.4.5-lts.1
- cloudinary ^2.2.0
- cors ^2.8.5
- dotenv ^16.4.5

### Frontend Dependencies
- @angular/core ^17.3.0
- @angular/material ^17.3.5
- bootstrap ^5.3.3
- primeng ^17.14.1
- apexcharts ^3.54.1
- rxjs ~7.8.0
- ngx-cookie-service ^17.1.0
- sweetalert2 ^11.6.13

---

This structure provides a scalable, maintainable architecture for the Lightstorm e-commerce platform.
