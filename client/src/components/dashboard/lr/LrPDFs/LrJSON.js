export default {
  _id: '6194f0bb92c9d400167fc038',
  user: {
    _id: '600ac7953ee4670344b0a81f',
    name: 'Ankit Arya',
    email: 'demo@devias.io',
    password: '$2a$10$9kQfxXmEkqKW1Xxzr2LSruFX1GaLN9K06LaqMhB4CDS5BbmIgNzYe',
    date: '2021-01-22T12:39:49.352Z',
    tokens: [],
    __v: 1,
    createdBy: '600ac7953ee4670344b0a81f',
    branchIds: [],
    mobile: '7698500001',
    marketName: 'Prime',
    waId: '917698500001',
    accountType: {
      commissionAgent: false,
      trader: true,
      vehicleOwner: true
    }
  },
  delivery: {
    _id: '6194effb92c9d400167fc035',
    order: '6194effb92c9d400167fc033',
    user: '600ac7953ee4670344b0a81f',
    trip: '6194effb92c9d400167fc034',
    status: 'pending',
    loading: {
      address_components: ['Bhalgam', 'Junagadh', 'Gujarat', 'India', '362110'],
      place_id: 'ChIJww_Q7YkHWDkRfeUfc-Usq54',
      structured_formatting: {
        secondary_text: 'Gujarat, India',
        main_text_matched_substrings: [
          {
            offset: 0,
            length: 7
          }
        ],
        main_text: 'Bhalgam'
      },
      description: 'Bhalgam, Gujarat, India',
      longitude: 70.59193570000001,
      latitude: 21.4600425
    },
    unloading: {
      address_components: ['Dahej', 'Bharuch', 'Gujarat', 'India'],
      place_id: 'ChIJhwd1pLh9XzkROLtbxDUJDpI',
      structured_formatting: {
        secondary_text: 'Gujarat, India',
        main_text_matched_substrings: [
          {
            offset: 0,
            length: 5
          }
        ],
        main_text: 'Dahej'
      },
      description: 'Dahej, Gujarat, India',
      longitude: 72.5842502,
      latitude: 21.7132151
    },
    __v: 1,
    saleOthers: [
      {
        expenseDisplay: 'invoice',
        expenseName: 'Others',
        expenseAmount: 1000
      }
    ]
  },
  trip: {
    _id: '6194effb92c9d400167fc034',
    isVehicleOwned: false,
    type: 'loose',
    order: '6194effb92c9d400167fc033',
    user: '600ac7953ee4670344b0a81f',
    vehicleNumber: 'GJ-06-AZ-0941',
    sale: {
      saleMinimumQuantity: '25',
      saleRate: '1300',
      saleType: 'quantity'
    },
    transporter: '6049ea67f6ffb60d7b8335b2',
    purchase: {
      purchaseMinimumQuantity: '25',
      purchaseRate: '1150',
      commissionType: 'fixed',
      purchaseType: 'quantity'
    },
    tripExpenses: [],
    route: ['Bhalgam', 'Dahej'],
    __v: 0,
    driverMobile: '7984868646',
    driverArrivalTime: '2021-11-17T19:30:00.000Z'
  },
  order: {
    _id: '6194effb92c9d400167fc033',
    user: '600ac7953ee4670344b0a81f',
    orderNo: 956,
    customer: {
      _id: '6049ea67f6ffb60d7b8335d4',
      __v: 0,
      user: '600ac7953ee4670344b0a81f',
      name: 'ADITYA',
      transporter: false,
      location: {
        latitude: 21.4600425,
        longitude: 70.59193570000001,
        description: 'Bhalgam, Gujarat, India',
        structured_formatting: {
          main_text: 'Bhalgam',
          main_text_matched_substrings: [
            {
              length: 6,
              offset: 0
            }
          ],
          secondary_text: 'Gujarat, India'
        },
        place_id: 'ChIJww_Q7YkHWDkRfeUfc-Usq54'
      },
      mobile: '9426816806'
    },
    saleDate: '2021-11-17T00:00:00.000Z',
    createdDate: '2021-11-17T12:05:15.122Z',
    __v: 0
  },
  lrNo: '4499',
  date: '2021-11-17T00:00:00.000Z',
  organisation: {
    _id: '600efe882a0ad35ed7058c52',
    user: '600ac7953ee4670344b0a81f',
    name: 'Prime Logistics',
    gstin: '24AAUFP8519P1Z8',
    jurisdiction: 'Rajkot',
    date: '2021-01-25T17:23:20.746Z',
    __v: 1,
    pan: 'AAUFP8519P1Z',
    initials: 'PL',
    counter: [
      {
        counterType: 'lr',
        fiscalYear: '2021-2022',
        count: '3543'
      }
    ],
    addressLine1: '20, Ahiya complex, Opp.jimmy tower, Gondal road , Rajkot',
    addressLine2: '',
    logo: {
      bucket: 'truckarprod',
      key: 'media/logos/600efe882a0ad35ed7058c52/logo.jpeg',
      location:
        'https://truckarprod.s3-ap-south-1.amazonaws.com/media/logos/600efe882a0ad35ed7058c52/logo.jpeg',
      status: 204
    },
    invoiceTermsAndConditions:
      '1. Please mention the invoice number on your cheque issued.\n2. Delay payment will attract interest @ 3% per month.\n3. Liability to pay G.S.T under goods transport service is of the recipient of the service.\n4. Subject to Rajkot Jurisdiction\n5. E. & O. E. ',
    bankAccountNumber: '2013450391',
    bankBranchName: 'Nath Vihar, Rajkot',
    bankIFSC: 'KKBK0000831',
    bankName: 'Kotak Bank'
  }
};
