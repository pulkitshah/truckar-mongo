import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





type AddressMetaData = {
  readOnlyFields: 'updatedAt';
}

type PartyMetaData = {
  readOnlyFields: 'updatedAt';
}

type OrderMetaData = {
  readOnlyFields: 'updatedAt';
}

type VehicleMetaData = {
  readOnlyFields: 'updatedAt';
}

type DriverMetaData = {
  readOnlyFields: 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type BranchMetaData = {
  readOnlyFields: 'updatedAt';
}

type OrganisationMetaData = {
  readOnlyFields: 'updatedAt';
}

export declare class Address {
  readonly id: string;
  readonly name?: string | null;
  readonly gstin?: string | null;
  readonly pan?: string | null;
  readonly billingAddressLine1?: string | null;
  readonly billingAddressLine2?: string | null;
  readonly city?: string | null;
  readonly createdAt?: string | null;
  readonly party?: Party | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Address, AddressMetaData>);
  static copyOf(source: Address, mutator: (draft: MutableModel<Address, AddressMetaData>) => MutableModel<Address, AddressMetaData> | void): Address;
}

export declare class Party {
  readonly id: string;
  readonly name?: string | null;
  readonly mobile?: string | null;
  readonly city?: string | null;
  readonly addresses?: (Address | null)[] | null;
  readonly isTransporter?: boolean | null;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Party, PartyMetaData>);
  static copyOf(source: Party, mutator: (draft: MutableModel<Party, PartyMetaData>) => MutableModel<Party, PartyMetaData> | void): Party;
}

export declare class Order {
  readonly id: string;
  readonly orderNo?: number | null;
  readonly saleDate?: string | null;
  readonly customer?: Party | null;
  readonly customerId?: string | null;
  readonly deliveries?: (string | null)[] | null;
  readonly vehicleNumber?: string | null;
  readonly vehicle?: Vehicle | null;
  readonly vehicleId?: string | null;
  readonly driver?: Driver | null;
  readonly driverId?: string | null;
  readonly driverExpenses?: string | null;
  readonly transporter?: Party | null;
  readonly transporterId?: string | null;
  readonly saleType?: string | null;
  readonly saleRate?: number | null;
  readonly minimumSaleGuarantee?: number | null;
  readonly purchaseType?: string | null;
  readonly purchaseRate?: number | null;
  readonly minimumPurchaseGuarantee?: number | null;
  readonly createdAt?: string | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Order, OrderMetaData>);
  static copyOf(source: Order, mutator: (draft: MutableModel<Order, OrderMetaData>) => MutableModel<Order, OrderMetaData> | void): Order;
}

export declare class Vehicle {
  readonly id: string;
  readonly vehicleNumber?: string | null;
  readonly make?: string | null;
  readonly model?: string | null;
  readonly createdAt?: string | null;
  readonly organisation?: string | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Vehicle, VehicleMetaData>);
  static copyOf(source: Vehicle, mutator: (draft: MutableModel<Vehicle, VehicleMetaData>) => MutableModel<Vehicle, VehicleMetaData> | void): Vehicle;
}

export declare class Driver {
  readonly id: string;
  readonly name?: string | null;
  readonly mobile?: string | null;
  readonly createdAt?: string | null;
  readonly createdBy?: string | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Driver, DriverMetaData>);
  static copyOf(source: Driver, mutator: (draft: MutableModel<Driver, DriverMetaData>) => MutableModel<Driver, DriverMetaData> | void): Driver;
}

export declare class User {
  readonly id: string;
  readonly name?: string | null;
  readonly email?: string | null;
  readonly phone_number?: string | null;
  readonly onBoardingRequired?: boolean | null;
  readonly driverExpensesCategories?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}

export declare class Branch {
  readonly id: string;
  readonly branchName?: string | null;
  readonly city?: string | null;
  readonly branchType?: string | null;
  readonly user?: string | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Branch, BranchMetaData>);
  static copyOf(source: Branch, mutator: (draft: MutableModel<Branch, BranchMetaData>) => MutableModel<Branch, BranchMetaData> | void): Branch;
}

export declare class Organisation {
  readonly id: string;
  readonly name?: string | null;
  readonly initials?: string | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly createdAt?: string | null;
  readonly pincode?: string | null;
  readonly contact?: string | null;
  readonly email?: string | null;
  readonly gstin?: string | null;
  readonly pan?: string | null;
  readonly invoiceTermsAndConditions?: string | null;
  readonly bankAccountNumber?: string | null;
  readonly bankName?: string | null;
  readonly bankBranchName?: string | null;
  readonly bankIFSC?: string | null;
  readonly logo?: string | null;
  readonly user?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Organisation, OrganisationMetaData>);
  static copyOf(source: Organisation, mutator: (draft: MutableModel<Organisation, OrganisationMetaData>) => MutableModel<Organisation, OrganisationMetaData> | void): Organisation;
}