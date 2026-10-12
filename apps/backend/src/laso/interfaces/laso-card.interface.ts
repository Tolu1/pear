export interface LasoCard {
  cardId: string;
  usdAmount: number;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  billingAddress: LasoBillingAddress;
}

export interface LasoBillingAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}
