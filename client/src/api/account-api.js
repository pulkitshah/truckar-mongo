import axios from "../utils/axios";
import { slice } from "../slices/accounts";

const now = new Date();

class AccountApi {
  async getAccountsByUser(user) {
    ////////////////////////  API ////////////////////////
    try {
      const response = await axios.get(`/api/account/${user.id}`);
      let accounts = response.data;

      return {
        status: response.status,
        data: accounts,
        error: false,
      };
    } catch (err) {
      console.error("[Account Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Cannot List Accounts, please try again or contact customer support.",
        };
      }
    }

    //////////////////////// API ////////////////////////
  }

  async createAccount(newAccount, dispatch) {
    ////////////////////////  API ////////////////////////

    try {
      const response = await axios.post(`/api/account/`, newAccount);
      let account = response.data;
      console.log(account);

      dispatch(slice.actions.createAccount({ account }));

      return {
        status: response.status,
        data: account,
        error: false,
      };
    } catch (err) {
      console.error("[Account Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Account not created, please try again or contact customer support.",
        };
      }
    }

    //////////////////////// API ////////////////////////
  }

  async updateAccount(editedAccount, dispatch) {
    ////////////////////////  API ////////////////////////
    try {
      const response = await axios.patch(
        `/api/account/${editedAccount.id}`,
        editedAccount
      );
      let account = response.data;
      console.log(account);

      dispatch(slice.actions.createAccount({ account }));
      return {
        status: response.status,
        data: account,
        error: false,
      };
    } catch (err) {
      console.error("[Account Api]: ", err);
      if (err) {
        return {
          status: 400,
          data: err,
          error:
            "Account not created, please try again or contact customer support.",
        };
      }
    }

    //////////////////////// API ////////////////////////
  }
}

export const accountApi = new AccountApi();
