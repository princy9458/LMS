import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Simple interface matching our Mongoose model closely
interface Course {
  _id: string;
  title: string;
  description: string;
  totalLessons: number;
}

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  items: [],
  loading: false,
  error: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCoursesLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setCoursesData(state, action: PayloadAction<Course[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCoursesError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCoursesLoading, setCoursesData, setCoursesError } = coursesSlice.actions;
export default coursesSlice.reducer;
