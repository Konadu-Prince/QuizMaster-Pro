import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchMySubscription
} from '../store/slices/subscriptionSlice';
import subscriptionService from '../services/subscriptionService';
import { 
  Check, 
  X, 
  Star, 
  Zap, 
  Crown,
  ArrowRight,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subscription, isCreating } = useSelector((state) => state.subscription);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMySubscription());
    }
  }, [isAuthenticated, dispatch]);

  const handleSelectPlan = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (planId === 'free') {
      toast.success('You are already on the free plan!');
      return;
    }

    try {
      const response = await subscriptionService.createCheckoutSession(planId);
      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await subscriptionService.createPortalSession();
      if (response.data.success) {
        // Redirect to Stripe billing portal
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open billing portal');
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Users,
      price: 0,
      annualPrice: 0,
      description: 'Perfect for getting started',
      features: [
        'Up to 5 quizzes',
        'Up to 10 questions per quiz',
        'Basic analytics',
        'Community support',
        'Standard templates'
      ],
      limitations: [
        'No custom branding',
        'No API access',
        'Limited analytics'
      ],
      popular: false,
      buttonText: 'Current Plan',
      buttonVariant: 'secondary'
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      price: 9.99,
      annualPrice: 99.99,
      description: 'For serious quiz creators',
      features: [
        'Up to 50 quizzes',
        'Up to 100 questions per quiz',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'Export data',
        'Custom themes',
        'Quiz templates'
      ],
      limitations: [],
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      price: 49.99,
      annualPrice: 499.99,
      description: 'For teams and organizations',
      features: [
        'Unlimited quizzes',
        'Unlimited questions',
        'Advanced analytics',
        'Custom branding',
        'API access',
        'White-label solution',
        'Priority support',
        'Custom integrations',
        'Team management',
        'SSO integration'
      ],
      limitations: [],
      popular: false,
      buttonText: 'Contact Sales',
      buttonVariant: 'premium'
    }
  ];

  const handlePlanSelect = async (planId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/pricing' } } });
      return;
    }

    if (planId === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    if (planId === 'enterprise') {
      // For enterprise, redirect to contact form
      navigate('/contact', { state: { plan: 'enterprise' } });
      return;
    }

    setSelectedPlan(planId);
    
    try {
      const response = await subscriptionService.createCheckoutSession(planId);
      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
    }
  };

  const getCurrentPlan = () => {
    return subscription?.plan || 'free';
  };

  const isCurrentPlan = (planId) => {
    return getCurrentPlan() === planId;
  };

  const getButtonText = (plan) => {
    if (isCurrentPlan(plan.id)) {
      if (plan.id === 'free') {
        return 'Current Plan';
      } else {
        return 'Manage Subscription';
      }
    }
    return plan.buttonText;
  };

  const getButtonVariant = (plan) => {
    if (isCurrentPlan(plan.id)) {
      return 'current';
    }
    return plan.buttonVariant;
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}/month`;
  };

  const formatAnnualPrice = (price) => {
    return price === 0 ? 'Free' : `$${price}/year`;
  };

  return (
    <>
      <Helmet>
        <title>Pricing - QuizMaster Pro</title>
        <meta name="description" content="Choose the perfect plan for your quiz creation needs. Free, Pro, and Enterprise plans available." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
                Choose the plan that's right for you. Upgrade or downgrade at any time.
              </p>
              
              {/* Billing Toggle */}
              <div className="mt-8 flex items-center justify-center">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="mx-3 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnnual ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  Annual
                </span>
                {isAnnual && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Save 17%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = isCurrentPlan(plan.id);
              const buttonText = getButtonText(plan);
              const buttonVariant = getButtonVariant(plan);
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${
                    plan.popular
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                      : isCurrent
                      ? 'border-green-500'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                        <Star className="h-4 w-4 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                        <Check className="h-4 w-4 mr-1" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex items-center">
                      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <h3 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                    </div>
                    
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                      {plan.description}
                    </p>
                    
                    <div className="mt-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {isAnnual ? formatAnnualPrice(plan.annualPrice) : formatPrice(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">
                            {isAnnual ? '/year' : '/month'}
                          </span>
                        )}
                      </div>
                      {isAnnual && plan.price > 0 && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Billed annually (${plan.price}/month)
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (isCurrent && plan.id !== 'free') {
                          handleManageSubscription();
                        } else {
                          handlePlanSelect(plan.id);
                        }
                      }}
                        disabled={(isCurrent && plan.id === 'free') || isCreating}
                      className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        buttonVariant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                          : buttonVariant === 'premium'
                          ? 'bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50'
                          : buttonVariant === 'current'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 cursor-default'
                          : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {isCreating ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          {buttonText}
                          {buttonVariant !== 'current' && (
                            <ArrowRight className="h-4 w-4 ml-2" />
                          )}
                        </div>
                      )}
                    </button>

                    <div className="mt-8">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        What's included:
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {feature}
                            </span>
                          </li>
                        ))}
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-500 dark:text-gray-500">
                              {limitation}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Can I change plans anytime?
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  What happens to my data if I cancel?
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Your data is preserved for 30 days after cancellation. You can reactivate your account anytime.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Do you offer refunds?
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  We offer a 30-day money-back guarantee for all paid plans. No questions asked.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Is there a free trial?
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Yes, you can start with our free plan and upgrade when you need more features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;