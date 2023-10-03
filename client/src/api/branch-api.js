import { API } from "aws-amplify";
import { branchesByUser } from "../graphql/queries";
import { createBranch, updateBranch } from "../graphql/mutations";
import { Branch } from "../models";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/branches";

const now = new Date();

class BranchApi {
  async getBranchesByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      // const response = await API.graphql({
      //   query: branchesByUser,
      //   variables: { user: user.id.toString() },
      // });
      // const branches = response.data.branchesByUser.items

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      const branches = await DataStore.query(Branch, (c) =>
        c.user("eq", user.id)
      );

      //////////////////////// DataStore API ////////////////////////

      // console.log(branches);

      // Dispatch - Reducer

      dispatch(slice.actions.getBranches(branches));

      return branches;
    } catch (error) {
      console.log(error);
    }
  }

  async createBranch(newBranch, dispatch) {
    const createdAt = moment().toISOString();
    let newOrg = newBranch;
    newOrg.createdAt = createdAt;

    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: createBranch,
      variables: { input: newOrg },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const branch = response.data.createBranch;

    //////////////////////// GraphQL API ////////////////////////

    //////////////////////// DataStore API ////////////////////////

    // const branch = await DataStore.save(new Branch(newOrg));

    //////////////////////// DataStore API ////////////////////////

    // Dispatch - Reducer

    dispatch(slice.actions.createBranch({ branch }));

    return branch;
  }

  async updateBranch(editedBranch, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateBranch,
      variables: { input: editedBranch },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const branch = response.data.updateBranch;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(branch);

    // Dispatch - Reducer

    dispatch(slice.actions.updateBranch({ branch }));

    return response;
  }
}

export const branchApi = new BranchApi();
