'use client';

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/modules/lms/store/store';
import { loginSuccess, loginFailure, setAuthLoading } from '@/modules/lms/store/slices/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.success && data.user) {
          dispatch(loginSuccess(data.user));
        } else {
          // No active session
          dispatch(setAuthLoading(false));
          dispatch(loginFailure('')); // Silent fail to avoid error splash for guests
        }
      } catch (error) {
        dispatch(setAuthLoading(false));
        dispatch(loginFailure(''));
      }
    };

    fetchSession();
  }, [dispatch]);

  return <>{children}</>;
}
