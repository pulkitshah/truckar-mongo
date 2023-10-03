import { combineReducers } from "@reduxjs/toolkit";

import { reducer as accountReducer } from "../slices/accounts";
import { reducer as orderReducer } from "../slices/orders";
import { reducer as lrReducer } from "../slices/lrs";
import { reducer as invoiceReducer } from "../slices/invoices";
import { reducer as organisationReducer } from "../slices/organisations";
import { reducer as vehicleReducer } from "../slices/vehicles";
import { reducer as branchReducer } from "../slices/branches";
import { reducer as driverReducer } from "../slices/drivers";
import { reducer as partyReducer } from "../slices/parties";
import { reducer as addressReducer } from "../slices/addresses";
import { reducer as deliveryReducer } from "../slices/deliveries";
import { reducer as userReducer } from "../slices/user";

export const rootReducer = combineReducers({
  accounts: accountReducer,
  orders: orderReducer,
  lrs: lrReducer,
  invoices: invoiceReducer,
  organisations: organisationReducer,
  vehicles: vehicleReducer,
  branches: branchReducer,
  drivers: driverReducer,
  parties: partyReducer,
  addresses: addressReducer,
  deliveries: deliveryReducer,
  user: userReducer,
});
