# Stripe Payment Link API Implementation

This implementation uses the **Stripe Payment Links API** to dynamically create payment links with:
- ✅ Dynamic amounts based on cart items
- ✅ Automatic redirect to `orderconfirmed.html` after payment
- ✅ Order metadata for tracking
- ✅ Support for multiple line items

## How It Works

The implementation uses Stripe's Payment Links API to create payment links on-the-fly:

1. **User clicks "Complete Payment"** → Frontend sends cart data to backend
2. **Backend creates Payment Link** → Uses `/api/create-payment-link` endpoint with:
   - Cart items as line items (with `price_data` for dynamic pricing)
   - Order metadata (order ID, stall name, food centre, etc.)
   - Redirect URL configured via `after_completion` API parameter
3. **Payment Link is generated** → Stripe returns a unique payment link URL
4. **User completes payment** → Stripe automatically redirects to `orderconfirmed.html`
5. **Order confirmation** → Page retrieves order data from `sessionStorage.pendingOrder`

## API Endpoint

### POST `/api/create-payment-link`

Creates a dynamic Stripe Payment Link with the following request body:

```json
{
  "items": [
    {
      "name": "Food Item",
      "price": 10.50,
      "quantity": 2,
      "description": "Description",
      "image": "https://..."
    }
  ],
  "shippingFee": 0,
  "totalAmount": 21.00,
  "orderId": "ORD123456",
  "stallName": "Stall Name",
  "foodCentre": "Food Centre",
  "pickupOption": "Dine In",
  "pickupTime": "ASAP",
  "successUrl": "http://localhost:10000/pages/order/orderconfirmed.html"
}
```

**Response:**
```json
{
  "url": "https://buy.stripe.com/test_...",
  "paymentLinkId": "plink_..."
}
```

## Testing

1. **Local Testing**:
   - Run `npm run server` (must be running for API to work)
   - Access `http://localhost:10000/pages/order/checkout.html`
   - Add items to cart and proceed to checkout
   - Select "Credit/Debit Card" payment method
   - Click "Complete Payment"
   - You should be redirected to a Stripe payment page
   - Complete test payment using Stripe test card: `4242 4242 4242 4242`
   - After payment, you'll be automatically redirected to `orderconfirmed.html`

2. **Production Testing**:
   - Ensure your production server has `STRIPE_SECRET_KEY` set
   - Test the full payment flow on your live site
   - The redirect URL is automatically set to your production domain

## Troubleshooting

- **"Failed to create payment link"**: Check that `STRIPE_SECRET_KEY` is set in your `.env` file
- **"Server returned an error"**: Make sure the server is running with `npm run server`
- **Redirect not working**: Payment Links created via API automatically have redirect configured via `after_completion`
- **Order data missing**: Check that `sessionStorage.pendingOrder` exists (check browser console)
- **Wrong domain**: The redirect URL is automatically set based on `window.location.origin`

## Important Notes

- ✅ **Dynamic amounts**: Payment Links are created dynamically with exact cart totals
- ✅ **Automatic redirect**: Redirect URL is configured via API - no dashboard setup needed
- ✅ **Order tracking**: Order data is saved to `sessionStorage` before redirect
- ✅ **Metadata**: Order details are included in Payment Link metadata for tracking in Stripe Dashboard
- ✅ **Multiple items**: Supports up to 20 line items per payment link
