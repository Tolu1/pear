export interface LasoCardApiResponse {
  card_id: string;
  status: string;
  usd_amount: number;
  card_details?: LasoCardDetails;
}

export interface LasoCardDetails {
  card_number: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
  billing_address: {
    name: string;
    line_1: string;
    line_2: string | null;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}
