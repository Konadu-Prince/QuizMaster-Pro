import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  MessageCircle,
  Link as LinkIcon,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, quiz, title = "Share Quiz" }) => {
  const [copied, setCopied] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: `Check out this quiz: ${quiz?.title || 'Amazing Quiz'}`,
    body: `I found this interesting quiz and thought you might enjoy it!\n\n${quiz?.title || 'Quiz'}\n\nTake it here: ${window.location.origin}/quizzes/${quiz?.id || ''}`
  });

  if (!isOpen) return null;

  const quizUrl = `${window.location.origin}/quizzes/${quiz?.id || ''}`;
  const shareText = `Check out this amazing quiz: ${quiz?.title || 'Quiz'} on QuizMaster Pro!`;
  const hashtags = '#QuizMasterPro #Learning #Education';

  const copyToClipboard = async (text, type = 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${type === 'link' ? 'Link' : 'Text'} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareToSocial = (platform) => {
    let url = '';
    const encodedUrl = encodeURIComponent(quizUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodeURIComponent(hashtags)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaEmail = () => {
    const { to, subject, body } = emailData;
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quiz?.title || 'Quiz',
          text: shareText,
          url: quizUrl,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      // Fallback to copy link
      copyToClipboard(quizUrl);
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: () => copyToClipboard(quizUrl),
      color: 'text-blue-600 hover:bg-blue-50',
      description: 'Copy quiz link to clipboard'
    },
    {
      name: 'Native Share',
      icon: Share2,
      action: shareViaNative,
      color: 'text-green-600 hover:bg-green-50',
      description: 'Use device share options'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => shareToSocial('twitter'),
      color: 'text-blue-400 hover:bg-blue-50',
      description: 'Share on Twitter'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => shareToSocial('facebook'),
      color: 'text-blue-600 hover:bg-blue-50',
      description: 'Share on Facebook'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => shareToSocial('linkedin'),
      color: 'text-blue-700 hover:bg-blue-50',
      description: 'Share on LinkedIn'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => shareToSocial('whatsapp'),
      color: 'text-green-600 hover:bg-green-50',
      description: 'Share on WhatsApp'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Quiz Info */}
          {quiz && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <img
                  src={quiz.image || '/api/placeholder/80/80'}
                  alt={quiz.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    by {quiz.author}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{quiz.questions} questions</span>
                    <span className="mx-2">•</span>
                    <span>{quiz.duration} min</span>
                    <span className="mx-2">•</span>
                    <span>{quiz.difficulty}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Share Options */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Share Options
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {shareOptions.map((option, index) => (
                <motion.button
                  key={option.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={option.action}
                  className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${option.color}`}
                >
                  <option.icon className="h-6 w-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{option.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Email Share */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Share via Email
              </h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To
                  </label>
                  <input
                    type="email"
                    value={emailData.to}
                    onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>
                
                <button
                  onClick={shareViaEmail}
                  disabled={!emailData.to}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>

            {/* Direct Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Direct Link
              </h4>
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={quizUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm"
                />
                <button
                  onClick={() => copyToClipboard(quizUrl)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShareModal;
