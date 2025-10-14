// import { useState, useEffect } from 'react';
// import { getProfile, updateProfile as apiUpdateProfile } from '@/api/auth';
// import { useAuth } from '@/lib/useAuth';

// export interface UserProfile {
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   age?: number;
//   country?: string;
//   address?: string;
//   bio?: string;
//   avatar?: string;
//   enrollments?: any[];
//   payments?: any[];
//   emailNotifications?: boolean;
//   courseNotifications?: boolean;
//   marketingEmails?: boolean;
//   accountType?: 'student' | 'adult';
//   role?: 'student' | 'instructor' | 'admin';
//   isActive?: boolean;
//   isEmailVerified?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
//   lastLoginAt?: string;
// }

// export function useUserProfile() {
//   const { user } = useAuth();
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const { data } = await getProfile();
//         const mapped: UserProfile = {
//           firstName: data.first_name,
//           lastName: data.last_name,
//           email: data.email,
//           bio: data.bio,
//           avatar: data.avatar,
//           role: data.role,
//           accountType: 'adult',
//         };
//         setUserProfile(mapped);
//       } catch (err) {
//         setError('Failed to fetch user profile');
//         setUserProfile(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserProfile();
//   }, [user?.email]);

//   const getFullName = () => {
//     if (!userProfile) return '';
//     return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
//   };

//   const getDisplayName = () => {
//     if (!userProfile) return user?.email || 'User';
//     return getFullName() || user?.email || 'User';
//   };

//   const saveProfile = async (payload: Record<string, any>) => {
//     await apiUpdateProfile(payload);
//     const { data } = await getProfile();
//     setUserProfile({
//       firstName: data.first_name,
//       lastName: data.last_name,
//       email: data.email,
//       bio: data.bio,
//       avatar: data.avatar,
//       role: data.role,
//       accountType: 'adult',
//     });
//   };

//   return {
//     userProfile,
//     loading,
//     error,
//     getFullName,
//     getDisplayName,
//     refetch: async () => {
//       const { data } = await getProfile();
//       setUserProfile({
//         firstName: data.first_name,
//         lastName: data.last_name,
//         email: data.email,
//         bio: data.bio,
//         avatar: data.avatar,
//         role: data.role,
//         accountType: 'adult',
//       });
//     },
//     saveProfile,
//   };
// }

import { useState, useEffect } from 'react';
import { getProfile, updateProfile as apiUpdateProfile } from '@/api/auth';
import { useAuth } from '@/lib/useAuth';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: number;
  country?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  enrollments?: any[];
  payments?: any[];
  emailNotifications?: boolean;
  courseNotifications?: boolean;
  marketingEmails?: boolean;
  accountType?: 'student' | 'adult';
  role?: 'student' | 'instructor' | 'admin';
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await getProfile();
        const mapped: UserProfile = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          bio: data.bio,
          avatar: data.avatar,
          role: data.role,
          phone: data.phone,
          age: data.age,
          country: data.country,
          address: data.address,

          accountType: 'adult',
        };
        setUserProfile(mapped);
      } catch (err) {
        setError('Failed to fetch user profile');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [user?.email]);

  const getFullName = () => {
    if (!userProfile) return '';
    return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  };

  const getDisplayName = () => {
    if (!userProfile) return user?.email || 'User';
    return getFullName() || user?.email || 'User';
  };

  const saveProfile = async (payload: Record<string, any>) => {
    await apiUpdateProfile(payload);
    const { data } = await getProfile();
    setUserProfile({
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      bio: data.bio,
      avatar: data.avatar,
      role: data.role,
      phone: data.phone,
      age: data.age,
      country: data.country,
      address: data.address,
      accountType: 'adult',
    });
  };

  return {
    userProfile,
    loading,
    error,
    getFullName,
    getDisplayName,
    refetch: async () => {
      const { data } = await getProfile();
      setUserProfile({
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        bio: data.bio,
        avatar: data.avatar,
        role: data.role,
        accountType: 'adult',
        phone: data.phone,
        age: data.age,
        country: data.country,
        address: data.address,
      });
    },
    saveProfile,
  };
}
