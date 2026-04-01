import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16' as any,
  appInfo: {
    name: 'LMS SaaS Plugin',
    version: '1.0.0'
  }
});

interface CheckoutParams {
  priceId: string;
  customerEmail: string;
  metadata: Record<string, string>;
}

export const createCheckoutSession = async ({ priceId, customerEmail, metadata }: CheckoutParams): Promise<Stripe.Checkout.Session> => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/lms/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/lms/payment/cancel`,
    customer_email: customerEmail,
    metadata
  });
};
