import { createSlice } from "@reduxjs/toolkit";

const userLimaesSlice = createSlice({
  name: "userLimaes",
  initialState: {
    data: null,
  },
  reducers: {
    setUserLimaes(state, action) {
      state.data = action.payload;
    },
  },
});

export const { setUserLimaes } = userLimaesSlice.actions;
export default userLimaesSlice.reducer;
