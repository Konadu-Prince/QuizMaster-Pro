const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const Subscription = require('../models/Subscription');

class StripeService {
  constructor() {
    this.stripe = stripe;
  }

  // Create a Stripe customer
  async createCustomer(user) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create a subscription
  async createSubscription(customerId, priceId) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  // Create a checkout session
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          customerId: customerId
        }
      });
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create a billing portal session
  async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Handle subscription created
  async handleSubscriptionCreated(subscription) {
    try {
      const customer = await this.stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;
      
      if (!userId) {
        console.error('No userId found in customer metadata');
        return;
      }

      const plan = this.getPlanFromPriceId(subscription.items.data[0].price.id);
      
      await Subscription.findOneAndUpdate(
        { user: userId },
        {
          plan: plan,
          status: 'active',
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        },
        { upsert: true, new: true }
      );

      console.log(`Subscription created for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
      throw error;
    }
  }

  // Handle subscription updated
  async handleSubscriptionUpdated(subscription) {
    try {
      const customer = await this.stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;
      
      if (!userId) {
        console.error('No userId found in customer metadata');
        return;
      }

      const plan = this.getPlanFromPriceId(subscription.items.data[0].price.id);
      const status = this.getSubscriptionStatus(subscription.status);
      
      await Subscription.findOneAndUpdate(
        { user: userId },
        {
          plan: plan,
          status: status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        }
      );

      console.log(`Subscription updated for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  // Handle subscription deleted
  async handleSubscriptionDeleted(subscription) {
    try {
      const customer = await this.stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;
      
      if (!userId) {
        console.error('No userId found in customer metadata');
        return;
      }

      await Subscription.findOneAndUpdate(
        { user: userId },
        {
          plan: 'free',
          status: 'cancelled',
          stripeSubscriptionId: null,
        }
      );

      console.log(`Subscription cancelled for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  // Handle payment succeeded
  async handlePaymentSucceeded(invoice) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await this.stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;
      
      if (!userId) {
        console.error('No userId found in customer metadata');
        return;
      }

      await Subscription.findOneAndUpdate(
        { user: userId },
        { status: 'active' }
      );

      console.log(`Payment succeeded for user ${userId}`);
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  // Handle payment failed
  async handlePaymentFailed(invoice) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await this.stripe.customers.retrieve(subscription.customer);
      const userId = customer.metadata.userId;
      
      if (!userId) {
        console.error('No userId found in customer metadata');
        return;
      }

      await Subscription.findOneAndUpdate(
        { user: userId },
        { status: 'past_due' }
      );

      console.log(`Payment failed for user ${userId}`);
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  // Get plan from price ID
  getPlanFromPriceId(priceId) {
    const priceMap = {
      [process.env.STRIPE_PRO_PRICE_ID]: 'pro',
      [process.env.STRIPE_ENTERPRISE_PRICE_ID]: 'enterprise',
    };
    return priceMap[priceId] || 'free';
  }

  // Get subscription status
  getSubscriptionStatus(stripeStatus) {
    const statusMap = {
      'active': 'active',
      'past_due': 'past_due',
      'canceled': 'cancelled',
      'unpaid': 'unpaid',
    };
    return statusMap[stripeStatus] || 'active';
  }

  // Get price ID from plan
  getPriceIdFromPlan(plan) {
    const priceMap = {
      'pro': process.env.STRIPE_PRO_PRICE_ID,
      'enterprise': process.env.STRIPE_ENTERPRISE_PRICE_ID,
    };
    return priceMap[plan];
  }
}

module.exports = new StripeService();

