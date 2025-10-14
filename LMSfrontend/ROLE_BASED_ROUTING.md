# Role-Based Routing Implementation

This document explains the role-based routing system implemented in the LMS application.

## Overview

The application now supports role-based access control with the following user roles:

- **Admin**: Full access to admin dashboard and all admin features
- **Student**: Access to student dashboard and learning features
- **Instructor**: Access to student dashboard (can be extended for instructor-specific features)

## Components Created

### 1. ProtectedRoute Component (`src/components/ProtectedRoute.tsx`)

- Ensures user is authenticated before accessing protected routes
- Redirects unauthenticated users to login page
- Shows loading state while checking authentication

### 2. RoleBasedRoute Component (`src/components/RoleBasedRoute.tsx`)

- Controls access based on user roles
- Redirects users to appropriate dashboard if they don't have required role
- Supports multiple allowed roles

### 3. DashboardRedirect Component (`src/components/DashboardRedirect.tsx`)

- Handles automatic redirection to appropriate dashboard based on user role
- Admin users → `/dashboard`
- Other users → `/student-dashboard`

## Routing Structure

### Public Routes (No Authentication Required)

- `/` - Home page
- `/courses` - Course listing
- `/course/:id` - Course details
- `/about` - About page
- `/contact` - Contact page
- `/LogIn` - Login page
- `/SignUp` - Sign up page
- `/forgot-password` - Password reset
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Protected Routes (Authentication Required)

#### Admin-Only Routes

- `/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/:id` - User profile
- `/admin/courses` - Course management
- `/admin/courses/:id` - Course details
- `/admin/courses-test` - Course testing
- `/admin/Finance` - Financial management
- `/admin/settings` - System settings

#### Student/Instructor Routes

- `/student-dashboard` - Student dashboard
- `/edit-profile` - Profile editing
- `/Store` - Course store
- `/learn/:courseId` - Learning interface

## How It Works

1. **Authentication Check**: `ProtectedRoute` verifies user is logged in
2. **Role Verification**: `RoleBasedRoute` checks if user has required role
3. **Automatic Redirection**: Users are redirected to appropriate dashboard based on role
4. **Fallback Handling**: Users without proper roles are redirected to student dashboard

## Usage Examples

### Admin Access

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["admin"]}>
        <AdminLayout>
          <Dashboard />
        </AdminLayout>
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>
```

### Student Access

```tsx
<Route
  path="/student-dashboard"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={["student", "instructor"]}>
        <StudentDashboard />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>
```

## Login Flow

1. User enters credentials on login page
2. System authenticates user and stores tokens
3. User profile is fetched to determine role
4. User is redirected to `/dashboard`
5. Role-based routing system:
   - If admin → Access granted to admin dashboard
   - If student/instructor → Redirected to student dashboard
   - If no role or insufficient permissions → Redirected to student dashboard

## Security Features

- **Authentication Required**: All protected routes require valid login
- **Role-Based Access**: Users can only access routes appropriate to their role
- **Automatic Redirects**: Users are automatically sent to correct dashboard
- **Token Management**: Access tokens are properly stored and managed
- **Loading States**: Proper loading indicators during authentication checks

## Error Handling

- Unauthenticated users are redirected to login
- Users without proper roles are redirected to student dashboard
- Loading states prevent flash of incorrect content
- Proper error messages for failed authentication

This implementation ensures that:

- Admin users can only access admin features
- Students and instructors access student dashboard
- Unauthenticated users cannot access protected routes
- Users are automatically redirected to appropriate dashboards based on their role
