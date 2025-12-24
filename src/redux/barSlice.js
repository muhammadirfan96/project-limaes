import { createSlice } from "@reduxjs/toolkit";

const barSlice = createSlice({
  name: "bar",
  initialState: {
    sidebar: true,
    bottombar: false,
    bottombarBackward: false,
  },
  reducers: {
    setSidebar(state) {
      state.sidebar = !state.sidebar;
    },
    setBottombar(state) {
      state.bottombar = !state.bottombar;
    },
    setBottombarBackward(state) {
      state.bottombarBackward = !state.bottombarBackward;
    },
  },
});

export const { setSidebar, setBottombar, setBottombarBackward } =
  barSlice.actions;
export default barSlice.reducer;
