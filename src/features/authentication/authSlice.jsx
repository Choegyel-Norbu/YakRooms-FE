import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const email = localStorage.getItem("email");
const userName = localStorage.getItem("userName");
const role = localStorage.getItem("role");
const pictureURL = localStorage.getItem("pictureURL");
const registerFlag = localStorage.getItem("registerFlag") === "true";
const clientDetailSet = localStorage.getItem("clientDetailSet") === "true";

const initialState = {
  loggedIn: !!token,
  token,
  userId,
  email,
  userName,
  role,
  pictureURL,
  registerFlag,
  clientDetailSet,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const {
        token,
        userId,
        email,
        userName,
        role,
        pictureURL,
        registerFlag,
        clientDetailSet,
      } = action.payload;

      // Update Redux state
      state.loggedIn = true;
      state.token = token;
      state.userId = userId;
      state.email = email;
      state.userName = userName;
      state.role = role;
      state.pictureURL = pictureURL;
      state.registerFlag = registerFlag;
      state.clientDetailSet = clientDetailSet;

      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      localStorage.setItem("userName", userName);
      localStorage.setItem("pictureURL", pictureURL);
      localStorage.setItem("registerFlag", registerFlag.toString());
      localStorage.setItem("clientDetailSet", clientDetailSet.toString());
    },
    logout: (state) => {
      state.loggedIn = false;
      state.token = null;
      state.userId = null;
      state.email = null;
      state.userName = "";
      state.role = "";
      state.pictureURL = "";
      state.registerFlag = false;
      state.clientDetailSet = false;

      localStorage.clear();
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
