import { configureStore } from "@reduxjs/toolkit";
import tokenReducer from "./tokenSlice.js";
import notificationReducer from "./notificationSlice.js";
import confirmationReducer from "./confirmationSlice.js";
import barReducer from "./barSlice.js";
import userLimaesReducer from "./userlimaesSlice.js";

const store = configureStore({
  reducer: {
    jwToken: tokenReducer,
    notificationAlert: notificationReducer,
    confirmationAlert: confirmationReducer,
    bar: barReducer,
    userLimaes: userLimaesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Menonaktifkan pengecekan serializability
    }),
});

export default store;
