import { API } from "aws-amplify";
import { organisationsByUser } from "../graphql/queries";
import { createOrganisation, updateOrganisation } from "../graphql/mutations";
import { Organisation } from "../models";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import moment from "moment";
import { slice } from "../slices/organisations";

const now = new Date();

class OrganisationApi {
  async getOrganisationsByUser(user, dispatch) {
    try {
      //////////////////////// GraphQL API ////////////////////////

      const response = await API.graphql({
        query: organisationsByUser,
        variables: { user: user.id.toString() },
      });
      const organisations = response.data.organisationsByUser.items;

      //////////////////////// GraphQL API ////////////////////////

      //////////////////////// DataStore API ////////////////////////

      // const organisations = await DataStore.query(Organisation, (c) =>
      //   c.user("eq", user.id)
      // );

      //////////////////////// DataStore API ////////////////////////

      // console.log(organisationesDB);

      // Dispatch - Reducer

      dispatch(slice.actions.getOrganisations(organisations));

      return organisations;
    } catch (error) {
      console.log(error);
    }
  }

  async createOrganisation(newOrganisation, dispatch) {
    const createdAt = moment().toISOString();
    let newOrg = newOrganisation;
    newOrg.createdAt = createdAt;

    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: createOrganisation,
      variables: { input: newOrg },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const organisation = response.data.createOrganisation;

    //////////////////////// GraphQL API ////////////////////////

    //////////////////////// DataStore API ////////////////////////

    // const organisation = await DataStore.save(new Organisation(newOrg));

    //////////////////////// DataStore API ////////////////////////

    // console.log(organisation);

    // Dispatch - Reducer

    dispatch(slice.actions.createOrganisation({ organisation }));

    return organisation;
  }

  async updateOrganisation(editedOrganisation, dispatch) {
    //////////////////////// GraphQL API ////////////////////////

    const response = await API.graphql({
      query: updateOrganisation,
      variables: { input: editedOrganisation },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });

    const organisation = response.data.updateOrganisation;

    //////////////////////// GraphQL API ////////////////////////

    // console.log(organisation);

    // Dispatch - Reducer

    dispatch(slice.actions.updateOrganisation({ organisation }));

    return response;
  }

  async validateDuplicateInitials(initials, user) {
    const response = await API.graphql({
      query: organisationsByUser,
      variables: { user: user.id.toString() },
    });
    const organisations = response.data.organisationsByUser.items;
    const organisation = organisations.find((organisation) => {
      return organisation.initials === initials;
    });
    return Boolean(!organisation);
  }
}

export const organisationApi = new OrganisationApi();
