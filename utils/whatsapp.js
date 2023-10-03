const axios = require('axios').default;
const moment = require('moment');

const whatsappConfig = {
  username: 'Admin',
  password: 'mPAe9Q}5;{@N$u-H',
  whatsappUrl: 'https://whatsapp-api-2043.clare.ai',
};

const { username, password, whatsappUrl } = whatsappConfig;
let token;
let expires_after;

const getWhatsappToken = async () => {
  const url = `${whatsappUrl}/v1/users/login`;
  // console.log(url)
  try {
    let response = await axios.post(
      url,
      {},
      {
        auth: {
          username,
          password,
        },
      }
    );
    console.log(response.data.users[0]);
    token = response.data.users[0].token;
    expires_after = response.data.users[0].expires_after;
    return response;
  } catch (error) {
    console.log(error.message);
  }
};

const sendDriverUpdate = async (order, trip, user) => {
  const url = `${whatsappUrl}/v1/messages`;

  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }
  let components = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: `${user.marketName} to ${order.customer.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')}`,
        },
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.driver
            ? `${trip.driver.name
                .toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')} ${
                trip.driver.mobile
                  ? '(' + trip.driver.mobile + ')'
                  : '(Mobile Not Updated)'
              }`
            : 'Not Updated',
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: `${trip.sale.saleMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.sale.saleType === 'quantity'
              ? `Rs. ${trip.sale.saleRate} / ton`
              : `Rs. ${trip.sale.saleRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `www.truckar.in`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      ['919769480620', ...user.waIds].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'driver_update',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log('error');
  }
};

const sendBookingConfirmationToOwnerForCommissionOrders = async (
  order,
  trip,
  user,
  customerUrl,
  transporterUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;

  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }
  let components = [
    {
      type: 'body',
      parameters: [
        // {
        //   type: 'text',
        //   text: `${user.marketName} to ${order.customer.name
        //     .toLowerCase()
        //     .split(' ')
        //     .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        //     .join(' ')}`,
        // },
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: `${
            trip.driverMobile
              ? '(' + trip.driverMobile + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${order.customer.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} ${
            order.customer._doc.mobile
              ? '(' + order.customer._doc.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.sale.saleMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.sale.saleType === 'quantity'
              ? `Rs. ${trip.sale.saleRate} / ton`
              : `Rs. ${trip.sale.saleRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `${customerUrl}`,
        },
        {
          type: 'text',
          text: `${trip.transporter._doc.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} ${
            trip.transporter._doc.mobile
              ? '(' + trip.transporter._doc.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text:
            trip.purchase.commissionType === 'quantity'
              ? `Rs. ${trip.purchase.purchaseRate} / ton`
              : trip.purchase.commissionType === 'fixed'
              ? `Rs. ${trip.purchase.purchaseRate} (Fixed)`
              : `${trip.purchase.purchaseRate} %`,
        },
        {
          type: 'text',
          text: `${transporterUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      [...user.waIds].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'booking_confirmation_for_owner_commission_2',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log('error');
  }
};

const sendBookingConfirmationToOwnerForTradingOrders = async (
  order,
  trip,
  user,
  customerUrl,
  transporterUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;

  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }
  let components = [
    {
      type: 'body',
      parameters: [
        // {
        //   type: 'text',
        //   text: `${user.marketName} to ${order.customer.name
        //     .toLowerCase()
        //     .split(' ')
        //     .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        //     .join(' ')}`,
        // },
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: `${
            trip.driverMobile
              ? '(' + trip.driverMobile + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${order.customer.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} ${
            order.customer._doc.mobile
              ? '(' + order.customer._doc.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.sale.saleMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.sale.saleType === 'quantity'
              ? `Rs. ${trip.sale.saleRate} / ton`
              : `Rs. ${trip.sale.saleRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `${customerUrl}`,
        },
        {
          type: 'text',
          text: `${trip.transporter._doc.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} ${
            trip.transporter._doc.mobile
              ? '(' + trip.transporter._doc.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.purchase.purchaseMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.purchase.purchaseType === 'quantity'
              ? `Rs. ${trip.purchase.purchaseRate} / ton`
              : `Rs. ${trip.purchase.purchaseRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `${transporterUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      [...user.waIds].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'booking_confirmation_for_owner_trading',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log('error');
  }
};

const sendBookingConfirmationToOwnerForSelfOrders = async (
  order,
  trip,
  user,
  customerUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;

  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }

  let components = [
    {
      type: 'body',
      parameters: [
        // {
        //   type: 'text',
        //   text: `${user.marketName} to ${order.customer.name
        //     .toLowerCase()
        //     .split(' ')
        //     .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        //     .join(' ')}`,
        // },
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: trip.driver
            ? `${trip.driver.name
                .toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')} ${
                trip.driver.mobile
                  ? '(' + trip.driver.mobile + ')'
                  : '(Mobile Not Updated)'
              }`
            : 'Not Updated',
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${order.customer.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} ${
            order.customer._doc.mobile
              ? '(' + order.customer._doc.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.sale.saleMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.sale.saleType === 'quantity'
              ? `Rs. ${trip.sale.saleRate} / ton`
              : `Rs. ${trip.sale.saleRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `${customerUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      [...user.waIds].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'booking_confirmation_for_owner_self',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log(error.errors ? error.errors : error);
  }
};

const sendBookingConfirmationToTransporters = async (
  order,
  trip,
  user,
  transporterUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;
  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }

  console.log(trip.transporter.waId);

  let components = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: `${
            trip.driverMobile
              ? '(' + trip.driverMobile + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${
            user.marketName ||
            '(Name Not Updated)'
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ')
          } ${
            user.mobile
              ? '(' + user.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.purchase.purchaseMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.purchase.purchaseType === 'quantity'
              ? `Rs. ${trip.purchase.purchaseRate} / ton`
              : `Rs. ${trip.purchase.purchaseRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `${transporterUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      ['919769480620', trip.transporter.waId].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'booking_confirmation_for_owner_self',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log(error.errors ? error.errors : error);
  }
};

const sendBookingConfirmationToTransportersForCommissionOrders = async (
  order,
  trip,
  user,
  transporterUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;
  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }

  console.log(trip.transporter.waId);

  let components = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: `${
            trip.driverMobile
              ? '(' + trip.driverMobile + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${
            user.marketName ||
            '(Name Not Updated)'
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ')
          } ${
            user.mobile
              ? '(' + user.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },
        {
          type: 'text',
          text:
            trip.purchase.commissionType === 'quantity'
              ? `Rs. ${trip.purchase.purchaseRate} / ton`
              : trip.purchase.commissionType === 'fixed'
              ? `Rs. ${trip.purchase.purchaseRate} (Fixed)`
              : `${trip.purchase.purchaseRate} %`,
        },
        {
          type: 'text',
          text: `${transporterUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      ['919769480620', trip.transporter.waId].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name:
                'booking_confirmation_to_transporters_for_commission_orders_2',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log(error.errors ? error.errors : error);
  }
};

const sendBookingConfirmationToCustomers = async (
  order,
  trip,
  user,
  customerUrl
) => {
  const url = `${whatsappUrl}/v1/messages`;
  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }
  // console.log(order.customer.waId);

  let components = [
    {
      type: 'body',
      parameters: [
        // {
        //   type: 'text',
        //   text: `${user.marketName} to ${order.customer.name
        //     .toLowerCase()
        //     .split(' ')
        //     .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        //     .join(' ')}`,
        // },
        {
          type: 'text',
          text: trip.vehicleNumber,
        },
        {
          type: 'text',
          text: trip.route.join('-'),
        },
        {
          type: 'text',
          text: trip.driver
            ? `${trip.driver.name
                .toLowerCase()
                .split(' ')
                .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                .join(' ')} ${
                trip.driver.mobile
                  ? '(' + trip.driver.mobile + ')'
                  : '(Mobile Not Updated)'
              }`
            : trip.driverMobile
            ? '(' + trip.driverMobile + ')'
            : '(Mobile Not Updated)',
        },
        {
          type: 'text',
          text: `${moment(trip.driverArrivalTime).format('llll')}`,
        },
        {
          type: 'text',
          text: `${
            user.marketName ||
            '(Name Not Updated)'
              .toLowerCase()
              .split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
              .join(' ')
          } ${
            user.mobile
              ? '(' + user.mobile.replace(/ /g, '') + ')'
              : '(Mobile Not Updated)'
          }`,
        },

        {
          type: 'text',
          text: `${trip.sale.saleMinimumQuantity || 0} MT`,
        },
        {
          type: 'text',
          text:
            trip.sale.saleType === 'quantity'
              ? `Rs. ${trip.sale.saleRate} / ton`
              : `Rs. ${trip.sale.saleRate} (Fixed)`,
        },
        {
          type: 'text',
          text: `Download LR - ${customerUrl}`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      ['919769480620', order.customer.waId].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'booking_confirmation_for_customer',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log(error.errors ? error.errors : error);
  }
};

const checkContacts = async (user) => {
  const url = `${whatsappUrl}/v1/contacts`;

  try {
    let response = await axios.post(
      url,
      {
        blocking: 'wait',
        contacts: user.mobiles,
        force_check: true,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.log('Send Whatsapp Check Contacts Error');
    console.log(error);
  }
};

const getWhatsappId = async (mobile) => {
  const url = `${whatsappUrl}/v1/contacts`;

  try {
    let response = await axios.post(
      url,
      {
        blocking: 'wait',
        contacts: [mobile],
        force_check: true,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 200) {
      const contact = response.data.contacts.find(
        (contact) => contact.input === mobile
      );
      return contact;
    } else {
      throw new Error('Something went wrong');
    }
  } catch (error) {
    console.log('Get Whatsapp ID Error');
    console.log(error);
  }
};
const sendProspectRegisterationWhatsappMessage = async (prospect) => {
  const url = `${whatsappUrl}/v1/messages`;

  if (expires_after < moment()) {
    console.log('Whatsapp token expired, Generating New Token');
    await getWhatsappToken();
  }
  let components = [
    {
      type: 'body',
      parameters: [
        {
          type: 'text',
          text: `नमस्कार ${prospect.name
            .toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')} 🙏🏼🙏🏼🙏🏼`,
        },
        {
          type: 'text',
          text: `Team Truckar (www.truckar.in)`,
        },
      ],
    },
  ];
  try {
    await Promise.all(
      ['919769480620', prospect.waId].map(async (waId) => {
        let response = await axios.post(
          url,
          {
            to: waId,
            type: 'template',
            template: {
              namespace: '77b40508_2468_4991_839a_fec3d079444b',
              name: 'prospect_registration_2',
              language: {
                policy: 'deterministic',
                code: 'en_GB',
              },
              components: components,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log(response.data);
        return response.data;
      })
    );
  } catch (error) {
    console.log('Send Whatsapp Text Message Error');
    console.log(error);
  }
};

module.exports = {
  getWhatsappToken,
  sendDriverUpdate,
  sendBookingConfirmationToOwnerForSelfOrders,
  sendBookingConfirmationToOwnerForTradingOrders,
  sendBookingConfirmationToOwnerForCommissionOrders,
  sendBookingConfirmationToTransporters,
  sendBookingConfirmationToTransportersForCommissionOrders,
  sendBookingConfirmationToCustomers,
  sendProspectRegisterationWhatsappMessage,
  getWhatsappId,
};
