import {
  BillingAddress,
  VirtualCard,
} from '../interfaces/virtual-card.interface';

export class VirtualCardResponseDto implements VirtualCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  billingEmail: string;
  billingAddress: BillingAddressDto;
}

export class BillingAddressDto implements BillingAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}
