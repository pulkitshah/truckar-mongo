export default {
  _id: '61934dd70dd61f0016d06a6f',
  user: {
    _id: '600ac7953ee4670344b0a81f',
    name: 'Ankit Arya',
    email: 'demo@devias.io',
    password: '$2a$10$9kQfxXmEkqKW1Xxzr2LSruFX1GaLN9K06LaqMhB4CDS5BbmIgNzYe',
    __v: 1,
    createdBy: '600ac7953ee4670344b0a81f',
    mobile: '7698500001',
    marketName: 'Prime',
    waId: '917698500001',
    accountType: {
      vehicleOwner: true,
      trader: true,
      commissionAgent: false
    },
    tokens: [],
    branchIds: [],
    date: '2021-01-22T12:39:49.352Z'
  },
  invoiceNo: '169',
  invoiceDate: '2021-11-16T00:00:00.000Z',
  sellerOrganisation: {
    _id: '600efe882a0ad35ed7058c52',
    user: '600ac7953ee4670344b0a81f',
    name: 'Prime Logistics',
    gstin: '24AAUFP8519P1Z8',
    jurisdiction: 'Rajkot',
    __v: 1,
    pan: 'AAUFP8519P1Z',
    initials: 'PL',
    addressLine1: '20, Ahiya complex, Opp.jimmy tower, Gondal road , Rajkot',
    addressLine2: '',
    logo: {
      status: 204,
      location:
        'https://truckarprod.s3-ap-south-1.amazonaws.com/media/logos/600efe882a0ad35ed7058c52/logo.jpeg',
      key: 'media/logos/600efe882a0ad35ed7058c52/logo.jpeg',
      bucket: 'truckarprod'
    },
    invoiceTermsAndConditions:
      '1. Please mention the invoice number on your cheque issued.\n2. Delay payment will attract interest @ 3% per month.\n3. Liability to pay G.S.T under goods transport service is of the recipient of the service.\n4. Subject to Rajkot Jurisdiction\n5. E. & O. E. ',
    bankAccountNumber: '2013450391',
    bankBranchName: 'Nath Vihar, Rajkot',
    bankIFSC: 'KKBK0000831',
    bankName: 'Kotak Bank',
    counter: [
      {
        count: '3543',
        fiscalYear: '2021-2022',
        counterType: 'lr'
      }
    ],
    date: '2021-01-25T17:23:20.746Z'
  },
  invoiceType: 'sale',
  __v: 1,
  buyerBillingAddress: {
    _id: '60f26eb46ea0660015a2efec',
    user: '600ac7953ee4670344b0a81f',
    party: '60f25f696ea0660015a2efe3',
    name: 'Mkc Infrastructure Limited',
    gstin: '24AAGCM6509F1ZM',
    pan: 'AAGCM6509F',
    billingAddressLine1: '"mkc House" 132,Mkc Tower,',
    billingAddressLine2: 'Tp No.9,Near Radiant School,Sargasan Chowkdi',
    city: {
      latitude: 23.2156354,
      longitude: 72.63694149999999,
      description: 'Gandhinagar, Gujarat, India',
      structured_formatting: {
        main_text: 'Gandhinagar',
        main_text_matched_substrings: [
          {
            length: 5,
            offset: 0
          }
        ],
        secondary_text: 'Gujarat, India'
      },
      place_id: 'ChIJCWhtfJgrXDkRkQM-h6cGb_g'
    },
    __v: 0
  },
  buyerOrganisation: null,
  buyerParty: {
    _id: '60f25f696ea0660015a2efe3',
    user: '600ac7953ee4670344b0a81f',
    name: 'mkc infra',
    mobile: '9978917599',
    location: {
      place_id: 'ChIJCWhtfJgrXDkRkQM-h6cGb_g',
      structured_formatting: {
        secondary_text: 'Gujarat, India',
        main_text_matched_substrings: [
          {
            offset: 0,
            length: 5
          }
        ],
        main_text: 'Gandhinagar'
      },
      description: 'Gandhinagar, Gujarat, India',
      longitude: 72.63694149999999,
      latitude: 23.2156354
    },
    transporter: false,
    waId: '919978917599',
    __v: 0
  },
  taxes: [
    {
      taxValue: '6',
      taxName: 'GST (C) - 6%'
    },
    {
      taxValue: '6',
      taxName: 'GST (S) - 6%'
    }
  ],
  deliveryIds: ['618e39b345e6bc00162ee3ab']
};
