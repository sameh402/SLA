# Role-Based Routing Flow

## User Login Flow

```
User Login
    ↓
Authentication Check
    ↓
Token Storage
    ↓
User Profile Fetch
    ↓
Role Determination
    ↓
Route Access Decision
```

## Route Access Decision Tree

```
User tries to access /dashboard
    ↓
Is user authenticated?
    ├─ No → Redirect to /LogIn
    └─ Yes → Check user role
        ├─ Admin → Access granted to admin dashboard
        ├─ Student → Redirect to /student-dashboard
        └─ Instructor → Redirect to /student-dashboard
```

## Component Hierarchy

```
App.tsx
├── AuthProvider (Authentication Context)
├── Routes
    ├── Public Routes (No protection)
    ├── Protected Routes
    │   ├── ProtectedRoute (Auth check)
    │   └── RoleBasedRoute (Role check)
    │       ├── Admin Routes (admin role only)
    │       └── Student Routes (student/instructor roles)
    └── Catch-all (404)
```

## Route Protection Levels

1. **Public Routes**: No authentication required
2. **Protected Routes**: Authentication required
3. **Role-Based Routes**: Specific roles required
4. **Admin Routes**: Admin role only

## Security Layers

1. **Authentication Layer**: ProtectedRoute component
2. **Authorization Layer**: RoleBasedRoute component
3. **Redirect Layer**: Automatic redirection based on role
4. **Fallback Layer**: Default to student dashboard for unauthorized access
