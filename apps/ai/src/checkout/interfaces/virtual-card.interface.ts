export interface VirtualCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  billingAddress: BillingAddress;
}

export interface BillingAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}
