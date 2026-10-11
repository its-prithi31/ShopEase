# ShopEase 🛍️ — Full-Stack Mobile E-Commerce Application

ShopEase is a complete, beginner-friendly full-stack mobile e-commerce application built with **React Native (Expo)**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

This project is tailored specifically for **Computer Science students preparing for technical interviews**, demonstrating clean architecture, RESTful API design, token-based authentication (JWT + bcrypt), responsive mobile UI, and state management without unnecessary bloated libraries.

---

## 📌 Architecture & Tech Stack

```
                          ┌───────────────────────────┐
                          │   React Native (Expo)     │
                          │   - Screens & Components  │
                          │   - React Navigation      │
                          │   - Context API (Auth/Cart)│
                          │   - Axios with JWT Intercept│
                          └─────────────┬─────────────┘
                                        │ HTTP / JSON (REST)
                                        ▼
                          ┌───────────────────────────┐
                          │   Express.js (Node.js)    │
                          │   - Routes & Controllers  │
                          │   - JWT Auth & Admin Guard│
                          │   - Central Error Handler │
                          └─────────────┬─────────────┘
                                        │ Mongoose ODM
                                        ▼
                          ┌───────────────────────────┐
                          │         MongoDB           │
                          │   - Users Collection      │
                          │   - Products Collection   │
                          │   - Orders Collection     │
                          └───────────────────────────┘
```

- **Frontend**: React Native, Expo SDK, React Navigation (Native Stack + Bottom Tabs), `@react-native-async-storage/async-storage`, `@expo/vector-icons`
- **Backend**: Node.js, Express.js, CORS, dotenv
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Stateless JSON Web Tokens (JWT) & bcrypt password hashing
- **HTTP Client**: Axios with request/response interceptors

---

## 🚀 Application Features

### 👤 Customer Features
1. **User Registration**: Form validation (email format, password min length, matching passwords).
2. **User Login & Logout**: Secure authentication using bcrypt comparison & JWT issuance. Persistent login with `AsyncStorage`.
3. **Browse Products**: Categorized catalog with product image, price, rating, and stock badges.
4. **Search & Filter**: Real-time keyword search and category filtering pills (*Electronics, Fashion, Footwear, Home, Accessories*).
5. **Product Details**: Full product description, stock availability check, quantity selector, and instant feedback.
6. **Cart Management**: Add items, increase/decrease quantities with inventory limits, remove items, clear cart.
7. **Pricing Breakdown**: Automatic subtotal, dynamic free delivery threshold calculation, and total price.
8. **Checkout & Order Placement**: Shipping address form, payment method selection, order summary, and automated stock reduction.
9. **Order History**: View all placed orders with items breakdown, statuses, tracking information, and formatted dates.

### 🛡️ Admin Features
1. **Role-Based Authorization**: Protected middleware guards administrative endpoints (`isAdmin: true`).
2. **Catalog Management**: View all store products in an inventory dashboard.
3. **Add Product**: Modal form to add title, price, description, category, image URL, and stock count.
4. **Edit Product**: Update product pricing, descriptions, categories, and inventory.
5. **Delete Product**: Safely delete products with confirmation prompts.
6. **Order Management**: Inspect every customer's order and update order statuses (*Pending ➔ Processing ➔ Shipped ➔ Delivered ➔ Cancelled*).

## ▶️ Run the Full App

Install dependencies once from the project root:

```bash
npm install
npm --prefix server install
npm --prefix client install
```

Then start the backend and the app together in one terminal:

```bash
npm start
```

This starts the API on `http://localhost:5000` and the Expo web app. The API and web logs share the terminal; stop both with `Ctrl+C`.

---

## 📂 Project Structure

```
shopease/
├── client/                     # React Native Expo Mobile App
│   ├── assets/                 # App icons, splash screens, and images
│   ├── components/             # Reusable UI components
│   │   ├── EmptyState.js       # Empty state placeholder
│   │   ├── LoadingSpinner.js   # Activity indicator with text
│   │   ├── ProductCard.js      # Grid item card with stock badge
│   │   └── SearchBar.js        # Search input with category filter pills
│   ├── context/                # Global React state management
│   │   ├── AuthContext.js      # User session, login, register, logout
│   │   └── CartContext.js      # Cart items, persistent storage, totals
│   ├── navigation/             # Navigation configurations
│   │   └── AppNavigator.js     # Auth stack & Bottom Tab navigator
│   ├── screens/                # Mobile application views
│   │   ├── AdminOrdersScreen.js    # Admin: View & update all orders
│   │   ├── AdminProductsScreen.js  # Admin: Manage catalog inventory
│   │   ├── CartScreen.js           # Cart view & price breakdown
│   │   ├── CheckoutScreen.js       # Shipping address & order confirmation
│   │   ├── HomeScreen.js           # Catalog grid, search & filter
│   │   ├── LoginScreen.js          # User sign-in with quick demo fill
│   │   ├── OrdersScreen.js         # Customer order history
│   │   ├── ProductDetailsScreen.js # Detailed item view & quantity
│   │   ├── ProfileScreen.js        # User details, API settings, logout
│   │   └── SignupScreen.js         # New account registration
│   ├── services/               # Network & API layer
│   │   ├── api.js              # Axios instance with JWT interceptor
│   │   ├── authService.js      # Authentication endpoints
│   │   ├── orderService.js     # Orders endpoints
│   │   └── productService.js   # Product catalog endpoints
│   ├── App.js                  # Application entry with Providers
│   └── package.json
│
├── server/                     # Node.js + Express REST API
│   ├── config/
│   │   └── db.js               # Mongoose database connection
│   ├── controllers/            # Route business logic
│   │   ├── authController.js   # Register, login, profile logic
│   │   ├── orderController.js  # Order placement, status tracking logic
│   │   └── productController.js# Product CRUD & search logic
│   ├── data/
│   │   └── sampleProducts.js   # Ready-to-use sample catalog data
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & Admin guards
│   │   └── errorMiddleware.js  # 404 handler & Mongoose error parser
│   ├── models/                 # Mongoose schemas
│   │   ├── Order.js            # Order collection schema
│   │   ├── Product.js          # Product collection schema
│   │   └── User.js             # User schema with bcrypt hooks
│   ├── routes/                 # Express API route definitions
│   │   ├── authRoutes.js       # /api/auth
│   │   ├── orderRoutes.js      # /api/orders
│   │   └── productRoutes.js    # /api/products
│   ├── .env                    # Environment variables
│   ├── .env.example            # Environment template
│   ├── seeder.js               # Database population script
│   ├── server.js               # Express application entry point
│   └── package.json
│
└── README.md                   # Complete documentation & interview guide
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **MongoDB**: A running local MongoDB instance (`mongod`) OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.
- **Expo Go App** (optional): Install on your physical phone ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)) to test on mobile, or run on your web browser.

---

### 2. Backend Setup (`/server`)

1. Open your terminal and navigate to `server`:
   ```bash
   cd server
   ```

2. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/shopease
   JWT_SECRET=shopease_jwt_secret_key_12345_secure
   NODE_ENV=development
   ```
   > **Note:** If using MongoDB Atlas, replace `MONGO_URI` with your connection string:
   > `mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopease?retryWrites=true&w=majority`

4. Seed the database with sample products and demo accounts:
   ```bash
   npm run seed
   ```
   *(This populates 8 sample products and sets up the demo customer and admin credentials.)*

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend API will run on `http://localhost:5000`.

---

### 3. Frontend Setup (`/client`)

1. Open a new terminal tab and navigate to `client`:
   ```bash
   cd client
   ```

2. Install frontend dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Launch the Expo development server:
   ```bash
   npx expo start
   ```

4. Choose your preferred testing platform:
   - **Web Browser (Fastest)**: Press `w` in the terminal to open the app directly in your browser.
   - **Physical Phone (Expo Go)**: Scan the QR code shown in the terminal with your phone camera (iOS) or Expo Go app (Android).
     > 💡 **Tip for Physical Mobile Testing**: When running on a phone via Wi-Fi, go to **Profile ➔ Server Network Endpoint** in the app and set your computer's local IP address (e.g. `http://192.168.1.X:5000/api`).
   - **Android Emulator**: Press `a` (uses `http://10.0.2.2:5000/api` automatically).
   - **iOS Simulator**: Press `i` (uses `http://localhost:5000/api` automatically).

---

## 🔑 Demo Credentials

For quick testing and interview demonstrations, the login screen includes **one-tap fill buttons**:

| Role | Email | Password | Access |
|---|---|---|---|
| **Customer** | `user@shopease.com` | `user123` | Browse, Cart, Checkout, Order History |
| **Admin** | `admin@shopease.com` | `admin123` | Catalog CRUD, Status Management, All Orders |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/profile` | Private | Get authenticated user profile |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (supports `?keyword=` and `?category=`) |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST` | `/api/products` | Admin | Create a new catalog item |
| `PUT` | `/api/products/:id` | Admin | Update existing product details & stock |
| `DELETE` | `/api/products/:id` | Admin | Delete a product from inventory |

### Orders (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Private | Place a new order (decrements inventory stock) |
| `GET` | `/api/orders/myorders` | Private | Retrieve logged-in customer's order history |
| `GET` | `/api/orders/:id` | Private | View specific order details |
| `GET` | `/api/orders` | Admin | View all store orders across all users |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status (`Shipped`, `Delivered`, etc.) |

---

## 🎓 Technical Interview Q&A Guide

When explaining this project in an engineering interview, use these key talking points:

### 1. How does the Authentication Flow work?
- **Password Security**: Passwords are never stored in plaintext. In `User.js`, a Mongoose `pre('save')` hook hashes passwords using `bcrypt.hash()` with 10 salt rounds. Salt defends against precomputed rainbow table attacks.
- **JWT Issuance**: Upon successful login, the server issues a JSON Web Token containing the user's `_id` signed with `JWT_SECRET`.
- **Stateless Authorization**: On the client, the token is stored in `AsyncStorage`. The Axios request interceptor (`services/api.js`) automatically attaches `Authorization: Bearer <token>` to requests. The backend `protect` middleware verifies the token signature without database session lookups.

### 2. How is State Management structured?
- Rather than adding excessive boilerplate with Redux or Zustand, the app uses React's native **Context API**:
  - `AuthContext`: Manages user credentials, authentication state, and session restoration on app boot.
  - `CartContext`: Manages cart items, derived subtotal/shipping calculations, and syncs updates to `AsyncStorage` so items persist across app reloads.

### 3. How does the database handle concurrency and inventory?
- When an order is placed (`controllers/orderController.js`), the controller iterates through items and verifies `product.countInStock >= item.qty`. It decrements stock atomically before saving the order.
- In high-throughput production environments, you can mention using MongoDB atomic operations like `{ $inc: { countInStock: -qty } }` with query condition `{ countInStock: { $gte: qty } }` to prevent race conditions without table locks.

### 4. How did you handle mobile network connectivity (localhost vs emulator vs device)?
- A common mobile development pitfall is that `localhost` on an Android emulator refers to the emulator itself, not the host machine.
- In `services/api.js`, `Platform.select()` maps Android to `10.0.2.2:5000` and iOS/Web to `localhost:5000`. Furthermore, a dynamic network settings modal in `ProfileScreen` allows testers on physical Wi-Fi devices to configure their host PC's IP address dynamically.
