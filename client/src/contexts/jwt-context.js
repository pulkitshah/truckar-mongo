import { createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import jwtDecode from "jwt-decode";
import { authApi } from "../api/auth-api";
import axios from "../utils/axios";
import { accountApi } from "../api/account-api";

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  accounts: [],
  account: null,
  user: null,
};

const isValidToken = (accessToken) => {
  if (!accessToken) {
    return false;
  }

  const decoded = jwtDecode(accessToken);
  const currentTime = Date.now() / 1000;

  return decoded.exp > currentTime;
};

const setSession = (accessToken) => {
  if (accessToken) {
    // console.log(`Token ${accessToken}`);
    localStorage.setItem("accessToken", accessToken);
    axios.defaults.headers.common["x-auth-token"] = accessToken;
  } else {
    localStorage.removeItem("accessToken");
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, accounts, account } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      accounts,
      account,
    };
  },
  LOGIN: (state, action) => {
    const { user, accounts, account } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      accounts,
      account,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    // user: null,
  }),
  REGISTER: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
      accounts,
      account,
    };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({
  ...initialState,
  platform: "JWT",
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  initialize: () => Promise.resolve(),
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = async () => {
    const accessToken = window.localStorage.getItem("accessToken");

    if (accessToken && isValidToken(accessToken)) {
      setSession(accessToken);
      const response = await authApi.me();

      if (response.status === 200 && response.data !== null) {
        const user = response.data;

        const response2 = await accountApi.getAccountsByUser(user);
        const accounts = response2.data;
        // console.log(accounts);

        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: true,
            user,
            accounts,
            account: accounts[0],
          },
        });
      } else {
        setSession(null);
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    } else {
      setSession(null);
      dispatch({
        type: "INITIALIZE",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });

    console.log(response);

    if (response.status === 200) {
      setSession(response.data.accessToken);

      const user = response.data.user;
      const response2 = await accountApi.getAccountsByUser(user);
      const accounts = response2.data;
      console.log(accounts);

      dispatch({
        type: "LOGIN",
        payload: {
          user,
          accounts,
          account: accounts[0],
        },
      });
    }
    return response;
  };

  const logout = async () => {
    localStorage.removeItem("accessToken");
    dispatch({ type: "LOGOUT" });
  };

  const register = async (mobile, email, name, password) => {
    const response = await authApi.register({ mobile, email, name, password });

    if (response.status === 201) {
      await login(email, password);
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: "JWT",
        login,
        logout,
        register,
        initialize,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;
