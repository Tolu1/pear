class Detection {
  type "regular_page" | "almost_payment_page" | "payment_page" @description(#"
  regular_page: No payment/checkout detected  
  almost_payment_page: Requires action to reach payment form
  payment_page: Ready to enter payment details
  "#)
  paymentData PaymentData?
}

class PaymentData {
  price string @description("Price with currency symbol and code in caps, if the decimal or cents part is 0 then remove it: '$2.99 USD', '₦5000 NGN'")
  amount string @description("Numeric amount only, e.g. '2.99', '5000'")
  currency string @description("Currency code in caps, e.g. 'USD', 'NGN'")
  merchantDomain string @description("Root domain: 'jumia.com.ng', 'chocolate.com'")
  paymentUrl string
}

function Detect(url: string, screenshot: image) -> Detection {
    client ClaudeSonnet
    prompt #"
      Extract this information:
      {{url}}
      {{screenshot}}
      {{ctx.output_format}}
      Explain reasoning in 3 sentences.
    "#
    
}

test StripePaymentDemoPageTest {
  functions [Detect]
  args {
    url "https://stripe-payments-demo.appspot.com/pay"
    screenshot { url "https://i.postimg.cc/fT0g9ZLZ/Screenshot-2025-08-01-at-15-34-03.png"}
  }
}