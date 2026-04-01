import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Job {
  _id: string;
  title: string;
  companyName: string; // derived from employer population or string depending on structure
  location?: string;
}

interface Internship {
  _id: string;
  title: string;
  companyName: string;
}

interface CareerPath {
  _id: string;
  careerName: string;
  description: string;
  requiredSkills: string[];
  recommendedCourses: any[]; // Course model references
}

interface OpportunitiesState {
  jobs: Job[];
  internships: Internship[];
  careerPaths: CareerPath[];
  loading: boolean;
}

const initialState: OpportunitiesState = {
  jobs: [],
  internships: [],
  careerPaths: [],
  loading: false,
};

const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<Job[]>) {
      state.jobs = action.payload;
    },
    setInternships(state, action: PayloadAction<Internship[]>) {
      state.internships = action.payload;
    },
    setCareerPaths(state, action: PayloadAction<CareerPath[]>) {
      state.careerPaths = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setJobs, setInternships, setCareerPaths, setLoading } = opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;
