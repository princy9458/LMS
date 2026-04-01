import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProgressRecord {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

interface ProgressState {
  lessonStatus: Record<string, boolean>; // lessonId -> completed
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  lessonStatus: {},
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setProgressLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setLessonStatus(state, action: PayloadAction<{ lessonId: string; completed: boolean }>) {
      const { lessonId, completed } = action.payload;
      state.lessonStatus[lessonId] = completed;
    },
    setAllProgress(state, action: PayloadAction<ProgressRecord[]>) {
      action.payload.forEach(record => {
        state.lessonStatus[record.lessonId] = record.completed;
      });
      state.loading = false;
      state.error = null;
    },
    setProgressError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setProgressLoading, setLessonStatus, setAllProgress, setProgressError } = progressSlice.actions;
export default progressSlice.reducer;
