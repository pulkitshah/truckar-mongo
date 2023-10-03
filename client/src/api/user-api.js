import { API } from "aws-amplify";
import { getUser } from "../graphql/queries";
import { updateUser } from "../graphql/mutations";
import { slice } from "../slices/user";

class UserApi {
  async getUser(cognitoUser) {
    const User = await API.graphql({
      query: getUser,
      variables: { id: cognitoUser.username },
    });
    return User;
  }

  async updateUser(editedUser, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateUser,
      variables: { input: editedUser },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const user = response.data.updateUser;

    //////////////////////// GraphQL API ////////////////////////

    // Dispatch - Reducer

    dispatch(slice.actions.updateUser({ user }));

    return response;
  }
}

export const userApi = new UserApi();
