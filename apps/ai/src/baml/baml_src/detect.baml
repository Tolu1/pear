class Detection {
  type "regular_page" | "almost_payment_page" | "payment_page" @description(#"
    regular_page: No payment/checkout detected
    almost_payment_page: One step away from payment page
    payment_page: Final payment form page
  "#)
  paymentData PaymentData
}

class PaymentData {
  price string @description("Price with currency: '$2.99', '₦5000'")
  merchantName string @description("Root domain: 'jumia.com.ng', 'chocolate.com'")
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