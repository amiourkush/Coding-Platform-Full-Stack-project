import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../src/utils/axiosClient";

export const fetchProblems = createAsyncThunk(
  "problem/fetchProblems",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get("/problem/getAllProblem");
      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSolvedProblems = createAsyncThunk(
  "problem/fetchSolvedProblems",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get(
        "/problem/solvedAllProblemByUser"
      );
      console.log(data);

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const problemSlice = createSlice({
  name: "problem",

  initialState: {
    problem: [],
    solvedProblem:[],
    loading: false,
    error: null
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchProblems.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problem = action.payload;
      })

      .addCase(fetchProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchSolvedProblems.pending, (state) => {
    state.loading = true;
})

.addCase(fetchSolvedProblems.fulfilled, (state, action) => {
    state.loading = false;
    state.solvedProblems = action.payload;
})

.addCase(fetchSolvedProblems.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
})
  }
});

export default problemSlice.reducer;