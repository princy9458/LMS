import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Enrollment {
  _id: string;
  courseId: string;
  status: 'active' | 'completed' | 'dropped';
}

interface EnrollmentsState {
  items: Enrollment[];
  loading: boolean;
}

const initialState: EnrollmentsState = {
  items: [],
  loading: false,
};

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    setEnrollments(state, action: PayloadAction<Enrollment[]>) {
      state.items = action.payload;
    },
    addEnrollment(state, action: PayloadAction<Enrollment>) {
      state.items.push(action.payload);
    },
  },
});

export const { setEnrollments, addEnrollment } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
