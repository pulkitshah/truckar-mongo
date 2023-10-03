import { createContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "../aws-exports";
import { userApi } from "../api/user-api";
Amplify.configure(awsconfig);

// import { amplifyConfig } from "../config";

// Amplify.configure(amplifyConfig);

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    // user: {},
  }),
  REGISTER: (state) => ({ ...state }),
  VERIFY_CODE: (state) => ({ ...state }),
  RESEND_CODE: (state) => ({ ...state }),
  PASSWORD_RECOVERY: (state) => ({ ...state }),
  PASSWORD_RESET: (state) => ({ ...state }),
  UPDATE_USER: (state) => {
    console.log(state);

    return { ...state };
  },
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({
  ...initialState,
  platform: "Amplify",
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  verifyCode: () => Promise.resolve(),
  resendCode: () => Promise.resolve(),
  passwordRecovery: () => Promise.resolve(),
  passwordReset: () => Promise.resolve(),
  updateUser: () => Promise.resolve(),
  initialize: () => Promise.resolve(),
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    initialize();
  }, []);

  const login = async (email, password) => {
    const cognitoUser = await Auth.signIn(email, password);
    const userDB = await userApi.getUser(cognitoUser);
    const user = userDB.data.getUser;

    if (user.challengeName) {
      console.error(
        `Unable to login, because challenge "${user.challengeName}" is mandated and we did not handle this case.`
      );
      return;
    }
    console.log(user);
    dispatch({
      type: "LOGIN",
      payload: {
        user: {
          id: user.id,
          avatar: "/static/mock-images/avatars/avatar-anika_visser.png",
          email: user.email,
          name: user.name,
          phone_number: user.phone_number,
          onBoardingRequired: user.onBoardingRequired,
          plan: "Premium",
          orderExpensesSettings: user.orderExpensesSettings
            ? JSON.parse(user.orderExpensesSettings)
            : [],
          lrSettings: JSON.parse(user.lrSettings),
          taxOptions: user.taxOptions ? JSON.parse(user.taxOptions) : [],
          lrFormat: user.lrFormat && user.lrFormat,
          invoiceFormat: user.invoiceFormat && user.invoiceFormat,
          _version: user._version,
        },
      },
    });
  };

  const logout = async () => {
    await Auth.signOut();
    dispatch({
      type: "LOGOUT",
    });
  };

  const register = async (name, email, mobile, password) => {
    await Auth.signUp({
      username: email,
      password,
      attributes: { email, phone_number: `+91${mobile}`, name },
    });
    dispatch({
      type: "REGISTER",
    });
  };

  const verifyCode = async (username, code) => {
    await Auth.confirmSignUp(username, code);
    dispatch({
      type: "VERIFY_CODE",
    });
  };

  const resendCode = async (username) => {
    await Auth.resendSignUp(username);
    dispatch({
      type: "RESEND_CODE",
    });
  };

  const passwordRecovery = async (username) => {
    await Auth.forgotPassword(username);
    dispatch({
      type: "PASSWORD_RECOVERY",
    });
  };

  const passwordReset = async (username, code, newPassword) => {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
    dispatch({
      type: "PASSWORD_RESET",
    });
  };

  const initialize = async () => {
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const userDB = await userApi.getUser(cognitoUser);
      const user = userDB.data.getUser;
      console.log(user);
      // Here you should extract the complete user profile to make it
      // available in your entire app.
      // The auth state only provides basic information.
      dispatch({
        type: "INITIALIZE",
        payload: {
          isAuthenticated: true,
          user: {
            id: user.id,
            avatar: "/static/mock-images/avatars/avatar-anika_visser.png",
            email: user.email,
            name: user.name,
            phone_number: user.phone_number,
            onBoardingRequired: user.onBoardingRequired,
            plan: "Premium",
            orderExpensesSettings: user.orderExpensesSettings
              ? JSON.parse(user.orderExpensesSettings)
              : [],
            lrSettings: user.lrSettings && JSON.parse(user.lrSettings),
            taxOptions: user.taxOptions && JSON.parse(user.taxOptions),
            lrFormat: user.lrFormat && user.lrFormat,
            invoiceFormat: user.invoiceFormat && user.invoiceFormat,
            _version: user._version,
          },
        },
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: "INITIALIZE",
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  };

  const updateUser = async (user) => {
    dispatch({
      type: "UPDATE_USER",
      payload: {
        user,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: "Amplify",
        login,
        logout,
        register,
        verifyCode,
        resendCode,
        passwordRecovery,
        passwordReset,
        updateUser,
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
