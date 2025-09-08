/**
 * Help & Support Page
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Book, 
  Video, 
  FileText,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  const faqSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Book,
      questions: [
        {
          question: 'How do I create my first quiz?',
          answer: 'To create your first quiz, click the "Create Quiz" button in the navigation bar or go to your dashboard and click "Create New Quiz". You can then add questions, set time limits, and customize your quiz before publishing it.'
        },
        {
          question: 'What types of questions can I create?',
          answer: 'You can create multiple choice questions, true/false questions, and fill-in-the-blank questions. Each question type supports rich text formatting, images, and explanations.'
        },
        {
          question: 'How do I share my quiz with others?',
          answer: 'Once you publish your quiz, you can share it by copying the quiz URL or using the built-in sharing options. You can also embed quizzes on your website using the provided embed code.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Billing',
      icon: HelpCircle,
      questions: [
        {
          question: 'How do I upgrade my subscription?',
          answer: 'Go to the Pricing page and select the plan that best fits your needs. You can upgrade at any time, and the new features will be available immediately.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.'
        },
        {
          question: 'What happens to my quizzes if I downgrade?',
          answer: 'Your existing quizzes will remain accessible, but you may hit limits on creating new quizzes or accessing premium features based on your new plan.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Usage',
      icon: FileText,
      questions: [
        {
          question: 'How do I track quiz performance?',
          answer: 'Visit your dashboard to see detailed analytics for each quiz, including completion rates, average scores, and individual responses. You can also export this data for further analysis.'
        },
        {
          question: 'Can I import quizzes from other platforms?',
          answer: 'Yes, you can import quizzes using our bulk import feature. We support JSON format imports, and you can find sample templates in our documentation.'
        },
        {
          question: 'How do I set up automated reminders?',
          answer: 'In your quiz settings, you can configure automated email reminders for incomplete quizzes. This helps improve completion rates and engagement.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: Video,
      questions: [
        {
          question: 'What browsers are supported?',
          answer: 'QuizMaster Pro works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.'
        },
        {
          question: 'Is there a mobile app?',
          answer: 'Currently, we offer a responsive web application that works great on mobile devices. We are working on native mobile apps for iOS and Android.'
        },
        {
          question: 'How do I report a bug?',
          answer: 'You can report bugs by contacting our support team through the contact form or by emailing support@quizmasterpro.com. Please include details about the issue and steps to reproduce it.'
        }
      ]
    }
  ];

  const resources = [
    {
      title: 'User Guide',
      description: 'Complete guide to using QuizMaster Pro',
      icon: Book,
      link: '/docs/user-guide',
      type: 'documentation'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step video tutorials',
      icon: Video,
      link: '/tutorials',
      type: 'video'
    },
    {
      title: 'API Documentation',
      description: 'Developer API reference',
      icon: FileText,
      link: '/docs/api',
      type: 'documentation'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: MessageCircle,
      link: '/community',
      type: 'community'
    }
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      contact: 'support@quizmasterpro.com',
      action: 'Send Email'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: MessageCircle,
      contact: 'Available 9 AM - 6 PM EST',
      action: 'Start Chat'
    }
  ];

  const filteredSections = faqSections.map(section => ({
    ...section,
    questions: section.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.questions.length > 0);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Help & Support - QuizMaster Pro</title>
        <meta name="description" content="Get help and support for QuizMaster Pro" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions, learn how to use features, and get the support you need.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {method.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      {method.contact}
                    </p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      {method.action}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {resource.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {resource.description}
                  </p>
                  <a
                    href={resource.link}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Learn More
                    <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
          
          {searchTerm && (
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filteredSections.reduce((total, section) => total + section.questions.length, 0)} results for "{searchTerm}"
            </p>
          )}

          <div className="space-y-4">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <Icon className="w-6 h-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {section.title}
                      </h3>
                      <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                        ({section.questions.length} questions)
                      </span>
                    </div>
                    {expandedSection === section.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedSection === section.id && (
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {section.questions.map((faq, index) => (
                          <div key={index} className="border-l-4 border-blue-200 dark:border-blue-800 pl-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {faq.question}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredSections.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try searching with different keywords or browse our FAQ sections.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Help;
