// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Address, Party, Order, Vehicle, Driver, User, Branch, Organisation } = initSchema(schema);

export {
  Address,
  Party,
  Order,
  Vehicle,
  Driver,
  User,
  Branch,
  Organisation
};