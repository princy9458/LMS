import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import coursesReducer from './slices/coursesSlice';
import enrollmentsReducer from './slices/enrollmentsSlice';
import opportunitiesReducer from './slices/opportunitiesSlice';
import progressReducer from './slices/progressSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    courses: coursesReducer,
    enrollments: enrollmentsReducer,
    opportunities: opportunitiesReducer,
    progress: progressReducer,
    auth: authReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
