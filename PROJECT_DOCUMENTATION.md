# Real Estate App Documentation

This document describes the current frontend and backend implementation, the main business flows, and how the screens connect to the APIs.

## 1. Project Overview

The project is a full-stack real estate application with:

- Public property browsing and search.
- User registration, login, JWT sessions, logout, and password reset APIs.
- Authenticated property posting and owner management.
- Property enquiries, buying request history, favorites, and viewed-property history.
- Contact form enquiries.
- Admin dashboard for users, properties, enquiries, and master data.
- Swagger UI at `http://localhost:4000/api-docs`.

## 2. Technology Stack

Frontend:

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Axios for API calls.
- Tailwind CSS classes through `globals.css`.
- Auth state in `src/context/AuthContext.tsx`.

Backend:

- Node.js and Express.
- Sequelize ORM.
- PostgreSQL.
- JWT access and refresh tokens.
- Multer local upload storage for property files.
- Nodemailer for contact and password reset emails.
- Swagger UI through `swagger-ui-express`.

## 3. Runtime URLs

- Frontend dev server: `http://localhost:3000`
- Backend API base: `http://localhost:4000/api`
- Backend Swagger UI: `http://localhost:4000/api-docs`
- Uploaded files: `http://localhost:4000/uploads/...`

Frontend environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Backend environment:

```env
PORT=4000
DB_DIALECT=postgres
DB_NAME=real_estate_app
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN_DAYS=30
```

## 4. High-Level Architecture

Frontend route files live in `frontend/src/app`. Shared API/session helpers live in:

- `src/lib/authSession.ts`
- `src/hooks/useApi.ts`
- `src/context/AuthContext.tsx`

Backend routes live in `backend/src/routes`. Each route delegates to controllers in `backend/src/controllers`, validates request data with `backend/src/validations`, and persists through Sequelize models in `backend/src/models`.

Common backend response shape:

```json
{
  "success": true,
  "message": "Readable status message",
  "data": {}
}
```

Common error shape:

```json
{
  "success": false,
  "message": "Readable error message",
  "errors": {}
}
```

## 5. Roles and Access

Guest users can:

- View public pages.
- Search and view verified active properties.
- Submit property enquiries with name, email, and mobile.
- Submit contact form enquiries.
- Register and login.

Authenticated users can:

- Post property listings.
- Edit and delete their own properties.
- Upload media to their own properties.
- Add or remove favorites.
- See recent activity: own listings, enquiries received, buying requests, viewed properties, and favorites.
- Mark received property enquiries as `contacted` or `closed`.

Admin users can:

- View all users and properties.
- Approve/unapprove users and properties.
- Activate/deactivate users and properties.
- View and update contact/property enquiry statuses.
- Manage state, city, category, and property type master data.
- View admin action logs.

Admin routes require a valid JWT for a user with role id `1`.

## 6. Frontend Page Map

| Route | File | Purpose | Main APIs |
| --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Home, featured property listings, filters, buying request modal | `GET /properties`, `GET /countries`, `GET /states`, `GET /cities`, `GET /categories`, `GET /property-types`, `POST /properties/:id/inquiries` |
| `/properties` | `src/app/properties/page.tsx`, `PropertiesList.tsx` | Search/list properties | Same lookup APIs plus `GET /properties` |
| `/properties/[propertyId]` | `page.tsx`, `PropertyDetails.tsx` | Property details, similar listings, enquiry, favorite | `GET /properties/:id`, `GET /properties/:id/similar`, `POST /properties/:id/inquiries`, `POST/DELETE /properties/:id/favorite` |
| `/post-property` | `src/app/post-property/page.tsx` | Authenticated property creation | Lookup APIs, `POST /properties`, `POST /properties/:id/media` |
| `/recent-activity` | `ActivityContent.tsx` | User activity dashboard | `GET /properties/my/list`, `/my/inquiries`, `/my/buying-requests`, `/my/viewed`, `/my/favorites`, `PATCH /properties/my/inquiries/:id/status` |
| `/profile` | `src/app/profile/page.tsx` | User profile/session area | Auth context, `GET /auth/me` |
| `/auth/login` | `src/app/auth/login/page.tsx` | Login | `POST /auth/login` |
| `/auth/register` | `src/app/auth/register/page.tsx` | Register | `POST /auth/register` |
| `/contact` | `src/app/contact/page.tsx` | Public contact form | `POST /contact` |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Admin control panel | Admin user/property/master/inquiry APIs |
| `/about`, `/services` | `src/app/about/page.tsx`, `src/app/services/page.tsx` | Static content pages | None |

## 7. Authentication Flow

1. Login/register sends credentials plus browser/device metadata.
2. Backend returns `access_token` and `refresh_token`.
3. Frontend stores both in `localStorage`.
4. Protected calls use `Authorization: Bearer <access_token>`.
5. If an API returns `401`, `authenticatedRequest` calls `POST /auth/refresh-token`.
6. If refresh succeeds, the original request is retried.
7. If refresh fails, tokens are cleared and `auth-session-expired` is dispatched.
8. Logout calls `POST /auth/logout` and clears local tokens.

## 8. Property Browse and Search Flow

1. Frontend loads lookup data: countries, states, cities, categories, property types.
2. User chooses filters such as location, city, category, property type, bedrooms, price range, area, furnishing, ownership, and parking.
3. Frontend calls `GET /api/properties` with query params.
4. Backend returns active and verified listings with related owner, location, category/type, media, amenities, and pagination.
5. Opening a property calls `GET /api/properties/:id`; if authenticated, the backend can record the view.
6. Similar listings are loaded from `GET /api/properties/:id/similar`.

Important list query params:

- `page`, `limit`
- `search`, `location`
- `category_id`, `property_type_id`, `state_id`, `city_id`
- `bedrooms`, `bathrooms`
- `min_price`, `max_price`
- `min_area`, `max_area`, `area_unit`
- `furnishing_status`, `parking`, `ownership_type`, `facing`
- `sort_by`: `created_at`, `price`, `bedrooms`
- `sort_order`: `ASC`, `DESC`

## 9. Post Property Flow

1. User must be logged in.
2. Frontend loads master data for dropdowns.
3. User fills property details.
4. Frontend sends `POST /api/properties`.
5. Backend validates required fields and creates the listing under the authenticated owner.
6. If images/files are selected, frontend sends multipart files to `POST /api/properties/:id/media`.
7. Media files are saved under `backend/uploads/properties` and served from `/uploads/properties/<file>`.
8. Admin can later approve/unapprove or activate/deactivate the property.

Required property fields:

- `property_type_id`
- `category_id`
- `country_id`
- `state_id`
- `city_id`
- `title`
- `price`

## 10. Enquiry and Contact Flow

Property enquiry:

1. Guest or logged-in user submits a property enquiry.
2. API: `POST /api/properties/:id/inquiries`.
3. Guest users should send `name`, `email`, and `mobile`; logged-in users can be linked by `user_id`.
4. Backend rate limits submissions and blocks duplicate open enquiries for the same property.
5. Property owner sees received enquiries in `/recent-activity`.
6. Owner can update status through `PATCH /api/properties/my/inquiries/:id/status`.

Contact enquiry:

1. Public contact form posts to `POST /api/contact`.
2. Backend stores the enquiry in `contact_inquiries`.
3. Backend sends an email notification to `CONTACT_MAIL_TO` or the default configured address.
4. Admin manages contact enquiry status from `/admin/dashboard`.

Status values:

- `pending`
- `contacted`
- `closed`

## 11. Recent Activity Flow

The user activity page combines five backend views:

- My posted properties: `GET /api/properties/my/list`
- Enquiries received for my properties: `GET /api/properties/my/inquiries`
- Buying requests I submitted: `GET /api/properties/my/buying-requests`
- Properties I viewed: `GET /api/properties/my/viewed`
- Favorite properties: `GET /api/properties/my/favorites`

This page is protected. If the access token expires, the frontend refreshes it automatically; if refresh fails, the user is returned to public pages.

## 12. Admin Dashboard Flow

On load, the admin dashboard fetches:

- `GET /api/admin/master/overview`
- `GET /api/admin/users?limit=100`
- `GET /api/admin/properties?limit=100`
- `GET /api/admin/inquiries/contact?limit=100`
- `GET /api/admin/inquiries/properties?limit=100`
- `GET /api/admin/master/states`
- `GET /api/admin/master/cities`
- `GET /api/admin/master/categories`
- `GET /api/admin/master/property-types`

Admin actions:

- User active/inactive: `PATCH /api/admin/users/:id/status`
- User approve/unapprove: `PATCH /api/admin/users/:id/verify`
- Property active/inactive: `PATCH /api/admin/properties/:id/status`
- Property approve/unapprove: `PATCH /api/admin/properties/:id/verify`
- Contact enquiry status: `PATCH /api/admin/inquiries/contact/:id/status`
- Property enquiry status: `PATCH /api/admin/inquiries/properties/:id/status`
- Master data create/update/delete under `/api/admin/master/...`

Admin actions are logged in `admin_logs` where implemented.

## 13. Backend API Inventory

Health:

- `GET /api/health`

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `POST /api/auth/forgot-password`
- `POST /api/auth/resend-otp`
- `POST /api/auth/otp-verify`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

Lookup:

- `GET /api/countries`
- `GET /api/states?country_id=1`
- `GET /api/cities?state_id=1`
- `GET /api/categories`
- `GET /api/property-types`

Public/User Properties:

- `GET /api/properties`
- `POST /api/properties`
- `GET /api/properties/:id`
- `PATCH /api/properties/:id`
- `DELETE /api/properties/:id`
- `GET /api/properties/:id/similar`
- `POST /api/properties/:id/media`
- `POST /api/properties/:id/favorite`
- `DELETE /api/properties/:id/favorite`
- `POST /api/properties/:id/inquiries`
- `GET /api/properties/my/list`
- `GET /api/properties/my/inquiries`
- `PATCH /api/properties/my/inquiries/:id/status`
- `GET /api/properties/my/buying-requests`
- `GET /api/properties/my/viewed`
- `GET /api/properties/my/favorites`

Contact:

- `POST /api/contact`

Admin Users:

- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/verify`
- `GET /api/admin/logs`

Admin Properties:

- `GET /api/admin/properties`
- `POST /api/admin/properties`
- `GET /api/admin/properties/:id`
- `PATCH /api/admin/properties/:id/verify`
- `PATCH /api/admin/properties/:id/status`

Admin Master:

- `GET /api/admin/master/overview`
- `GET|POST /api/admin/master/states`
- `PATCH|DELETE /api/admin/master/states/:id`
- `GET|POST /api/admin/master/cities`
- `PATCH|DELETE /api/admin/master/cities/:id`
- `GET|POST /api/admin/master/categories`
- `PATCH|DELETE /api/admin/master/categories/:id`
- `GET|POST /api/admin/master/property-types`
- `PATCH|DELETE /api/admin/master/property-types/:id`

Admin Inquiries:

- `GET /api/admin/inquiries/contact`
- `PATCH /api/admin/inquiries/contact/:id/status`
- `GET /api/admin/inquiries/properties`
- `PATCH /api/admin/inquiries/properties/:id/status`

## 14. Database Tables

Current implemented tables include:

- `roles`
- `countries`
- `states`
- `cities`
- `users`
- `user_sessions`
- `categories`
- `property_types`
- `amenities`
- `properties`
- `property_amenities`
- `property_media`
- `property_social_links`
- `property_views`
- `favorites`
- `property_inquiries`
- `contact_inquiries`
- `admin_logs`

Detailed table notes are also available in `backend/docs/database-tables.md`.

## 15. Swagger Coverage

Swagger is configured in `backend/src/docs/openapi.js` and served through `backend/src/app.js`.

The current Swagger spec includes:

- Core auth APIs.
- Lookup APIs.
- Contact form API.
- Public and authenticated property APIs.
- Favorite and recent activity APIs.
- Property inquiry APIs.
- Admin user APIs.
- Admin property APIs.
- Admin master data APIs.
- Admin contact/property enquiry APIs.

Open it at:

```text
http://localhost:4000/api-docs
```

## 16. Local Development

Backend:

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend runs pending migrations and seeders on startup as implemented in the server startup flow.

## 17. Important Implementation Notes

- Access tokens are short-lived; refresh tokens are stored in `user_sessions`.
- Frontend API calls should use `authenticatedRequest` or `useApi` where authentication and refresh behavior are needed.
- Guest property enquiry creation is allowed, but authenticated users get better tracking in recent activity.
- Property media upload uses form-data field `files`; max upload count and file type rules are enforced by backend upload middleware.
- Public property listing only exposes active and verified records.
- Admin list endpoints are intentionally broader and require admin role.
- Contact emails require mail environment variables for real delivery; the enquiry is still stored before mail sending is attempted.

## 18. Complete Frontend Implementation Reference

Frontend root: `frontend`

Important files:

| File | Used For |
| --- | --- |
| `package.json` | Frontend dependencies and scripts. |
| `.env` | API URL configuration. |
| `next.config.ts` | Next.js configuration. |
| `tsconfig.json` | TypeScript configuration. |
| `src/app/layout.tsx` | Global app shell, metadata, fonts, `AuthProvider`, `Header`, `Footer`, `ScrollToTop`. |
| `src/app/globals.css` | Global CSS and Tailwind setup/custom styling. |
| `src/context/AuthContext.tsx` | User session state, login, register, logout, session restore. |
| `src/lib/authSession.ts` | Token storage, refresh token call, authenticated axios wrapper. |
| `src/hooks/useApi.ts` | Reusable React hook for API requests with loading/error state. |
| `src/components/layout/Header.tsx` | Site header wrapper. |
| `src/components/layout/Navbar.tsx` | Desktop/mobile navigation, auth menu, admin link visibility. |
| `src/components/layout/Footer.tsx` | Footer links, contact/address information. |
| `src/components/layout/ScrollToTop.tsx` | Scroll-to-top behavior/control. |
| `src/components/layout/Popup.tsx` | Simple reusable popup/modal component. |
| `src/components/property/PropertyCard.tsx` | Property listing card UI and image URL handling. |
| `src/components/property/FavoriteButton.tsx` | Favorite/unfavorite interaction. |

Frontend dependencies:

| Package | Purpose |
| --- | --- |
| `next` | React framework and routing. |
| `react`, `react-dom` | UI library/runtime. |
| `axios` | HTTP client. |
| `react-icons` | Icons used by layout/navigation/UI. |
| `tailwindcss`, `@tailwindcss/postcss` | Styling. |
| `typescript` | Type checking. |
| `eslint`, `eslint-config-next` | Linting. |

Frontend scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

Frontend environment variables:

| Variable | Used By | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser/client code | Backend API base URL, default fallback is `http://localhost:4000/api`. |
| `API_URL` | Present in `.env` | Not used by the observed frontend client helpers; `NEXT_PUBLIC_API_URL` is the important browser variable. |

Frontend route details:

| Route | Main Components/Behavior |
| --- | --- |
| `/` | Public homepage with property search/listing sections and buying enquiry modal. Uses lookup APIs and property APIs. |
| `/properties` | Full property listing/search page. Uses `PropertiesList.tsx`. |
| `/properties/[propertyId]` | Server page fetches property details initially; client component handles similar properties, enquiry, and favorites. |
| `/post-property` | Authenticated property creation page. Loads countries, states, cities, categories, property types; creates property and uploads media. |
| `/recent-activity` | Protected user dashboard. Shows posted listings, received enquiries, buying requests, viewed listings, favorite listings. |
| `/profile` | Protected profile/account page. Uses current authenticated user from context. |
| `/auth/login` | Login form. Calls `AuthContext.login`. |
| `/auth/register` | Register form. Calls `AuthContext.register`. |
| `/contact` | Public contact form. Calls `POST /api/contact`. |
| `/admin/dashboard` | Protected admin panel. Requires authenticated user with `role_id === 1`. |
| `/about` | Static information page. |
| `/services` | Static services page. |

Frontend auth behavior:

- Tokens are stored in `localStorage` as `access_token` and `refresh_token`.
- `AuthProvider` tries to restore the session on app load.
- `GET /auth/me` loads the current user.
- Login/register add browser metadata: `browser`, `device_name`, `device_type`.
- `authenticatedRequest` automatically retries once after `401` by calling `POST /auth/refresh-token`.
- If refresh fails, tokens are removed and a browser event named `auth-session-expired` is dispatched.
- Protected pages should rely on `useAuth()` state before showing sensitive data.
- Navbar hides Contact for admin users and shows Admin Dashboard only when `user.role_id === 1`.

Frontend API helper behavior:

`resolveApiBaseUrl()`:

- Returns `process.env.NEXT_PUBLIC_API_URL`.
- Falls back to `http://localhost:4000/api`.

`authenticatedRequest()`:

- Adds `Authorization: Bearer <access_token>` when present.
- Uses axios `baseURL`.
- Refreshes token on `401` unless `skipAuthRefresh` is set.

`useApi()`:

- Supports immediate requests.
- Tracks `response`, `error`, `isLoading`, `hasLoaded`.
- Returns `request()` for manual API calls.

Frontend image/media handling:

- Backend media may come as `/uploads/...`.
- Frontend converts relative upload paths into backend origin URLs by removing `/api` from the API base URL.
- Property cards/details use fallback UI if no image is available.

## 19. Complete Backend Implementation Reference

Backend root: `backend`

Important files:

| File/Folder | Used For |
| --- | --- |
| `package.json` | Backend dependencies and scripts. |
| `.env` | Server, database, JWT, mail configuration. |
| `src/server.js` | Loads `.env`, authenticates Sequelize, starts Express server. |
| `src/app.js` | Express app setup: security, CORS, body parsing, uploads, Swagger, routes, error handling. |
| `src/routes` | Route definitions and middleware composition. |
| `src/controllers` | Request handlers and business logic. |
| `src/models` | Sequelize model definitions and associations. |
| `src/migrations` | Database table migrations. |
| `src/seeders` | Initial roles, countries, locations, categories, property types, amenities, users, properties. |
| `src/validations` | Custom request validation schemas. |
| `src/middlewares` | Auth, validation, upload, rate-limit, error handling. |
| `src/helpers` | JWT, response, request, mailer, admin logs, property views, password reset helpers. |
| `src/docs/openapi.js` | Swagger/OpenAPI definition. |
| `docs/database-tables.md` | Database table status and notes. |
| `uploads/properties` | Local property media upload storage. |

Backend dependencies:

| Package | Purpose |
| --- | --- |
| `express` | API server. |
| `sequelize` | ORM. |
| `pg` | PostgreSQL driver. |
| `dotenv` | Environment variables. |
| `cors` | Cross-origin browser access. |
| `helmet` | Security headers. |
| `bcryptjs` | Password hashing. |
| `jsonwebtoken` | JWT access tokens. |
| `multer` | Multipart file uploads. |
| `nodemailer` | Email sending. |
| `express-rate-limit` | Rate limiting auth/password/inquiry endpoints. |
| `swagger-ui-express` | Swagger UI at `/api-docs`. |
| `nodemon` | Development server reload. |
| `sequelize-cli` | Migrations and seeders. |

Backend scripts:

```bash
npm run start
npm run dev
npm run migrate
npm run seed
npm run pg:start
npm run pg:stop
```

Backend environment variables:

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime environment. |
| `PORT` | Backend port. Current local value is `4000`. |
| `DB_HOST` | PostgreSQL host. |
| `DB_PORT` | PostgreSQL port. |
| `DB_NAME` | Database name. |
| `DB_USER` | Database user. |
| `DB_PASSWORD` | Database password. |
| `DB_DIALECT` | Sequelize dialect, currently `postgres`. |
| `DB_LOGGING` | Set `true` to print SQL logs. |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens. |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime, default/found value `15m`. |
| `JWT_REFRESH_EXPIRES_IN_DAYS` | Refresh session lifetime in days. |
| `BCRYPT_SALT_ROUNDS` | Password hashing cost. |
| `DEFAULT_USER_PASSWORD` | Seeder/default password. |
| `PASSWORD_RESET_OTP_EXPIRES_IN_MINUTES` | OTP expiry. |
| `PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES` | Reset token expiry. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | SMTP email settings. |
| `CONTACT_MAIL_TO` | Optional contact enquiry recipient. Falls back to `redsandgroup.in@gmail.com`. |

Backend Express setup:

- `helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })`
- `cors()`
- `express.json()`
- `express.urlencoded({ extended: true })`
- Static uploads mounted at `/uploads`
- Swagger mounted at `/api-docs`
- API routes mounted at `/api`
- 404 handled by `notFound`
- Error responses handled by `errorHandler`

Backend security/access middleware:

| Middleware | Behavior |
| --- | --- |
| `MainAuth` | Requires `Authorization: Bearer <token>`, verifies JWT, loads active user, sets `req.user`. |
| `optionalAuth` | Reads JWT if present, ignores missing/invalid tokens, sets `req.user` when valid. |
| `checkRole(1)` | Allows only admin role id `1`. |
| `validate(schema, property)` | Validates `body`, `query`, or `params`; returns `422` on validation errors. |
| `notFound` | Returns `404` for unknown routes. |
| `errorHandler` | Returns JSON error response. |

Rate limits:

| Limiter | Window | Max | Used For |
| --- | --- | --- | --- |
| `authRateLimiter` | 15 minutes | 20 | Register/login. |
| `passwordResetRateLimiter` | 15 minutes | 5 | Forgot password, resend OTP, verify OTP, reset password. |
| `inquiryRateLimiter` | 15 minutes | 5 | Property enquiry submissions. |

Upload rules:

- Route: `POST /api/properties/:id/media`.
- Form field: `files`.
- Max files: `10`.
- Max file size: `50 MB`.
- Storage folder: `backend/uploads/properties`.
- Filename pattern: `<timestamp>-<random>.<ext>`.
- Allowed MIME groups:
  - Images: JPEG, PNG, WEBP.
  - Videos: MP4, MPEG, QuickTime, WEBM, AVI.
  - Documents: PDF, Word, Excel, PowerPoint, plain text.
- Stored media type is derived as `image`, `video`, or `document`.

## 20. Backend Models and Relationships

Models:

| Model | Table | Purpose |
| --- | --- | --- |
| `Role` | `roles` | User role master, including admin/user roles. |
| `Country` | `countries` | Country master data. |
| `State` | `states` | State master linked to country. |
| `City` | `cities` | City master linked to country and state. |
| `User` | `users` | Authentication/profile users with role, status, verification. |
| `UserSession` | `user_sessions` | Refresh token sessions, expiry, revoked status, device info. |
| `AdminLog` | `admin_logs` | Admin audit trail. |
| `Category` | `categories` | Listing category such as Sale/Rent/Lease. |
| `PropertyType` | `property_types` | Property type with group `flat`, `land`, or `commercial`. |
| `Property` | `properties` | Main listing record. |
| `Amenity` | `amenities` | Amenity master. |
| `PropertyAmenity` | `property_amenities` | Many-to-many property amenity relation. |
| `PropertyMedia` | `property_media` | Images, videos, documents for properties. |
| `PropertySocialLink` | `property_social_links` | Social/website links for a property. |
| `PropertyView` | `property_views` | Tracks viewed properties by user/IP and count. |
| `Favorite` | `favorites` | Favorite relation between user and property. |
| `PropertyInquiry` | `property_inquiries` | Buyer/contact enquiries for a property. |
| `ContactInquiry` | `contact_inquiries` | Public contact page enquiries. |

Main relationships:

- `User belongsTo Role` as `role`.
- `Role hasMany User` as `users`.
- `Country hasMany State`; `State belongsTo Country`.
- `State hasMany City`; `City belongsTo State`.
- `Country hasMany City`; `City belongsTo Country`.
- `User hasMany UserSession` as `sessions`.
- `User hasMany AdminLog` as `admin_logs`.
- `User hasMany Property` as `properties`.
- `Property belongsTo User` as `owner`.
- `Property belongsTo PropertyType` as `property_type`.
- `Property belongsTo Category` as `category`.
- `Property belongsTo Country`, `State`, and `City`.
- `Property belongsToMany Amenity` through `PropertyAmenity`.
- `Property hasMany PropertyMedia` as `media`.
- `Property hasMany PropertySocialLink` as `social_links`.
- `Property hasMany PropertyView` as `views`.
- `User hasMany PropertyView` as `property_views`.
- `User belongsToMany Property` through `Favorite` as `favorite_properties`.
- `Property belongsToMany User` through `Favorite` as `favorited_by_users`.
- `Property hasMany PropertyInquiry` as `inquiries`.
- `PropertyInquiry belongsTo Property` as `property`.
- `PropertyInquiry belongsTo User` as `user`.

Important status fields:

| Field | Meaning |
| --- | --- |
| `status: 1/0` | Active/inactive for users, locations, properties, and some masters. |
| `is_verified: 1/0` | Approval state for users and properties. |
| `ContactInquiry.status` | `pending`, `contacted`, `closed`. |
| `PropertyInquiry.status` | `pending`, `contacted`, `closed`. |
| `PropertyInquiry.priority` | `low`, `normal`, `high`, `urgent`. |

## 21. Backend Validation Rules

Auth validation:

- Register requires `first_name`, `last_name`, `email`, `phone`, `password`.
- Email must be valid.
- Password must pass configured strength validation in `helpers/validation.js`.
- Login requires `email` and `password`.
- Refresh requires `refresh_token`.
- Forgot password requires `email`.
- Resend OTP requires `temp_token`.
- OTP verify requires `temp_token` and `otp`.
- Reset password requires `reset_token` and new `password`.

Contact validation:

- `name` required, letters and single spaces, max 100 chars.
- `mobile` required, exactly 10 digits.
- `email` required, valid, max 150 chars.
- `message` required, max 1000 chars.

Property validation:

- Create requires `property_type_id`, `category_id`, `country_id`, `state_id`, `city_id`, `title`, `price`.
- `title` max 150 chars.
- `slug` max 180 chars and generated from title when missing.
- `price` must be a valid number and cannot be negative.
- Integer fields include bedrooms, bathrooms, balconies, floor number, total floors, property age.
- Number fields include area, latitude, longitude.
- `furnishing_status`: `unfurnished`, `semi-furnished`, `furnished`.
- `area_unit`: `sq_ft`, `sq_m`, `acres`, `cents`.
- `ownership_type`: `owner`, `builder`, `agent`.
- `parking`: `0` or `1`.
- `amenity_ids` must be an array of positive integers.
- `media` must contain valid type, URL, sort order, primary/status flags.
- `social_links` platform must be one of `facebook`, `instagram`, `youtube`, `linkedin`, `twitter`, `whatsapp`, `telegram`, `website`.

Property list validation:

- `page` positive integer.
- `limit` between 1 and 100.
- `status` and `is_verified`: `0` or `1`.
- `category_id`, `property_type_id`, `state_id`, `city_id`, `bedrooms`, `bathrooms`: positive integers.
- `min_price`, `max_price`, `min_area`, `max_area`: valid non-negative numbers.
- Min cannot be greater than max.
- `sort_by`: `created_at`, `price`, `bedrooms`.
- `sort_order`: `ASC`, `DESC`.

Admin validation:

- Admin property create also requires `user_id`.
- Admin user status uses `status: 0|1`.
- Admin user verify uses `is_verified: 0|1`.
- Admin property status uses `status: 0|1`.
- Admin property verify uses `is_verified: 0|1`.

## 22. Detailed API Behavior Notes

Auth:

- Register creates a user, hashes password, creates a session, returns tokens.
- Login checks credentials and active status, creates a session, returns tokens.
- Refresh validates the refresh token session and rotates/returns new tokens.
- Logout can revoke the current refresh session.
- Logout all revokes all sessions for the user.
- Forgot password creates an OTP/temp token flow.
- OTP verification returns a reset token.
- Reset password updates password after reset token verification.
- `GET /auth/me` returns the authenticated user.

Properties:

- Public list returns only active and verified listings.
- Admin list can include broader property data and filters.
- Property details includes related owner/location/category/type/media/amenities/social links.
- Authenticated property detail view records a property view by user and IP.
- Guest property view can be tracked by IP depending on optional auth request data.
- Similar properties are ranked by city, property type, category, state, bedrooms, and price range.
- Owner-only update/delete is enforced in controller logic.
- Property delete is a deletion flow handled by Sequelize/model behavior.
- Favorite add prevents duplicate favorites.
- Favorite remove deletes the favorite relation.

Property enquiries:

- `POST /properties/:id/inquiries` supports guest and authenticated users.
- Duplicate open enquiries are blocked for same property/user or guest email/mobile.
- Owner receives enquiries under `/properties/my/inquiries`.
- Buyer sees submitted enquiries under `/properties/my/buying-requests`.
- Enquiry owner/property owner can update status through the allowed route.

Contact enquiries:

- `POST /contact` stores the enquiry before sending mail.
- Email recipient uses `CONTACT_MAIL_TO`, fallback `redsandgroup.in@gmail.com`.
- If mail config is missing, `sendMail` logs instead of sending.

Admin:

- Admin routes use `MainAuth` and `checkRole(1)`.
- Admin overview counts users, properties, pending users/properties, contact enquiries, property enquiries, states, cities, property types.
- Admin master save routes use the same handler for create and update based on whether `:id` is present.
- Admin status actions write admin logs where implemented.

## 23. Seeded Data and Startup Notes

Seeders exist for:

- Roles.
- Countries.
- India locations.
- Users.
- Property types.
- Categories.
- Amenities.
- Properties.

Migrations exist for all current tables from `roles` through `contact_inquiries`.

Current `src/server.js` authenticates the database and starts the server. Manual migration and seed commands are available:

```bash
npm run migrate
npm run seed
```

The backend README says startup runs pending migrations/seeders, but the observed `src/server.js` currently only authenticates Sequelize and starts Express. If automatic migration/seed startup is required, that should be added explicitly or the README statement should be adjusted.

## 24. UI and Navigation Details

Global shell:

- `layout.tsx` uses Google Geist fonts.
- Metadata is optimized for Red Sand Group real estate SEO.
- The shell wraps every page with `AuthProvider`, `Header`, `Footer`, and `ScrollToTop`.

Navbar:

- Desktop nav shows Home, Properties, Contact, and Information dropdown.
- Information dropdown contains About and Services.
- Mobile nav has collapsible menu.
- Authenticated users see account menu.
- Account menu links: Sell Property, Admin Dashboard for admins, My Activity, Profile, Logout.
- Admin users do not see Contact in main nav.

Footer:

- Includes navigation/contact-oriented site links.
- Includes Google Maps link for the listed address.

Popup:

- Simple local-state modal.
- Props: `buttonText`, `title`, `message`.

## 25. Known Documentation and Implementation Notes

- Swagger is now broader than the original core-only spec and includes admin/contact/recent activity coverage.
- The frontend currently has many route folders untracked relative to the frontend Git repository state; do not assume Git status is clean.
- The root `D:\real-estate-app` and backend folder are not Git repositories in this workspace; only `frontend` has a `.git` folder.
- Backend `.env` contains local credentials and secrets. Do not commit real secrets in a public repository.
- Mail delivery needs real SMTP variables; without `MAIL_HOST`, mail is logged and not sent.
- Uploaded files are local filesystem files. For production, use durable object storage or volume persistence.
- Swagger server URL is `http://localhost:4000`, and each path includes `/api/...`.
- Frontend client code must use `NEXT_PUBLIC_API_URL`, not a private-only env variable, because it runs in the browser.
- Admin role is determined by `role_id === 1` in both backend authorization and frontend navigation.
