/**
 * Share Service - Handles all sharing functionality
 * Provides utilities for sharing quizzes across different platforms
 */

class ShareService {
  constructor() {
    this.baseUrl = window.location.origin;
    this.platforms = {
      twitter: {
        name: 'Twitter',
        baseUrl: 'https://twitter.com/intent/tweet',
        icon: 'twitter',
        color: '#1DA1F2'
      },
      facebook: {
        name: 'Facebook',
        baseUrl: 'https://www.facebook.com/sharer/sharer.php',
        icon: 'facebook',
        color: '#4267B2'
      },
      linkedin: {
        name: 'LinkedIn',
        baseUrl: 'https://www.linkedin.com/sharing/share-offsite/',
        icon: 'linkedin',
        color: '#0077B5'
      },
      whatsapp: {
        name: 'WhatsApp',
        baseUrl: 'https://wa.me/',
        icon: 'whatsapp',
        color: '#25D366'
      },
      telegram: {
        name: 'Telegram',
        baseUrl: 'https://t.me/share/url',
        icon: 'telegram',
        color: '#0088CC'
      },
      reddit: {
        name: 'Reddit',
        baseUrl: 'https://reddit.com/submit',
        icon: 'reddit',
        color: '#FF4500'
      },
      pinterest: {
        name: 'Pinterest',
        baseUrl: 'https://pinterest.com/pin/create/button/',
        icon: 'pinterest',
        color: '#E60023'
      }
    };
  }

  /**
   * Generate a shareable URL for a quiz
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   * @returns {string} Shareable URL
   */
  generateQuizUrl(quiz, options = {}) {
    const { includeParams = true, shortUrl = false } = options;
    
    let url = `${this.baseUrl}/quizzes/${quiz.id}`;
    
    if (includeParams) {
      const params = new URLSearchParams();
      
      // Add referral source if available
      if (options.source) {
        params.append('ref', options.source);
      }
      
      // Add campaign tracking
      if (options.campaign) {
        params.append('utm_campaign', options.campaign);
      }
      
      // Add medium
      if (options.medium) {
        params.append('utm_medium', options.medium);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return url;
  }

  /**
   * Generate share text for a quiz
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   * @returns {string} Share text
   */
  generateShareText(quiz, options = {}) {
    const { 
      includeAuthor = true, 
      includeStats = true, 
      customMessage = null,
      maxLength = 280 
    } = options;
    
    let text = customMessage || `Check out this amazing quiz: "${quiz.title}"`;
    
    if (includeAuthor && quiz.author) {
      text += ` by ${quiz.author}`;
    }
    
    if (includeStats) {
      const stats = [];
      if (quiz.questions) stats.push(`${quiz.questions} questions`);
      if (quiz.duration) stats.push(`${quiz.duration} min`);
      if (quiz.difficulty) stats.push(`${quiz.difficulty} level`);
      
      if (stats.length > 0) {
        text += ` (${stats.join(', ')})`;
      }
    }
    
    text += ' on QuizMaster Pro!';
    
    // Truncate if too long
    if (text.length > maxLength) {
      text = text.substring(0, maxLength - 3) + '...';
    }
    
    return text;
  }

  /**
   * Share to a specific social media platform
   * @param {string} platform - Platform name
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   */
  shareToPlatform(platform, quiz, options = {}) {
    const platformConfig = this.platforms[platform.toLowerCase()];
    if (!platformConfig) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const url = this.generateQuizUrl(quiz, options);
    const text = this.generateShareText(quiz, options);
    const hashtags = options.hashtags || ['QuizMasterPro', 'Learning', 'Education'];
    
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const encodedHashtags = encodeURIComponent(hashtags.join(','));

    switch (platform.toLowerCase()) {
      case 'twitter':
        shareUrl = `${platformConfig.baseUrl}?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
        break;
      case 'facebook':
        shareUrl = `${platformConfig.baseUrl}?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `${platformConfig.baseUrl}?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `${platformConfig.baseUrl}?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `${platformConfig.baseUrl}?url=${encodedUrl}&text=${encodedText}`;
        break;
      case 'reddit':
        shareUrl = `${platformConfig.baseUrl}?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'pinterest':
        shareUrl = `${platformConfig.baseUrl}?url=${encodedUrl}&description=${encodedText}`;
        if (quiz.image) {
          shareUrl += `&media=${encodeURIComponent(quiz.image)}`;
        }
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Open in new window
    const windowFeatures = 'width=600,height=400,scrollbars=yes,resizable=yes';
    window.open(shareUrl, '_blank', windowFeatures);
    
    // Track sharing event
    this.trackShareEvent(platform, quiz, options);
  }

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Share using native Web Share API
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success status
   */
  async shareNative(quiz, options = {}) {
    if (!navigator.share) {
      return false;
    }

    try {
      const shareData = {
        title: quiz.title,
        text: this.generateShareText(quiz, options),
        url: this.generateQuizUrl(quiz, options)
      };

      await navigator.share(shareData);
      this.trackShareEvent('native', quiz, options);
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    }
  }

  /**
   * Generate email share content
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   * @returns {Object} Email data
   */
  generateEmailContent(quiz, options = {}) {
    const { 
      recipient = '', 
      customSubject = null, 
      customBody = null,
      includeQuizDetails = true 
    } = options;

    const subject = customSubject || `Check out this quiz: ${quiz.title}`;
    
    let body = customBody || `Hi there!\n\nI found this interesting quiz and thought you might enjoy it!\n\n`;
    
    if (includeQuizDetails) {
      body += `Quiz: ${quiz.title}\n`;
      if (quiz.author) body += `Author: ${quiz.author}\n`;
      if (quiz.questions) body += `Questions: ${quiz.questions}\n`;
      if (quiz.duration) body += `Duration: ${quiz.duration} minutes\n`;
      if (quiz.difficulty) body += `Difficulty: ${quiz.difficulty}\n`;
      if (quiz.description) body += `Description: ${quiz.description}\n`;
      body += `\n`;
    }
    
    body += `Take the quiz here: ${this.generateQuizUrl(quiz, options)}\n\n`;
    body += `Best regards!`;

    return {
      to: recipient,
      subject,
      body
    };
  }

  /**
   * Share via email
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   */
  shareViaEmail(quiz, options = {}) {
    const emailData = this.generateEmailContent(quiz, options);
    const mailtoUrl = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    
    window.location.href = mailtoUrl;
    this.trackShareEvent('email', quiz, options);
  }

  /**
   * Generate QR code URL for quiz
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   * @returns {string} QR code URL
   */
  generateQRCodeUrl(quiz, options = {}) {
    const url = this.generateQuizUrl(quiz, options);
    const qrService = options.qrService || 'https://api.qrserver.com/v1/create-qr-code/';
    const size = options.size || '200x200';
    const format = options.format || 'png';
    
    return `${qrService}?size=${size}&data=${encodeURIComponent(url)}&format=${format}`;
  }

  /**
   * Track sharing events for analytics
   * @param {string} platform - Platform name
   * @param {Object} quiz - Quiz object
   * @param {Object} options - Additional options
   */
  trackShareEvent(platform, quiz, options = {}) {
    // This would integrate with your analytics service
    const eventData = {
      event: 'quiz_shared',
      platform,
      quizId: quiz.id,
      quizTitle: quiz.title,
      timestamp: new Date().toISOString(),
      ...options
    };

    // Example: Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: 'quiz',
        item_id: quiz.id
      });
    }

    // Example: Send to custom analytics
    if (window.analytics) {
      window.analytics.track('Quiz Shared', eventData);
    }

    console.log('Share event tracked:', eventData);
  }

  /**
   * Get available sharing platforms
   * @returns {Array} List of available platforms
   */
  getAvailablePlatforms() {
    return Object.keys(this.platforms).map(key => ({
      key,
      ...this.platforms[key]
    }));
  }

  /**
   * Check if native sharing is supported
   * @returns {boolean} Native share support status
   */
  isNativeShareSupported() {
    return navigator.share && typeof navigator.share === 'function';
  }

  /**
   * Check if clipboard API is supported
   * @returns {boolean} Clipboard support status
   */
  isClipboardSupported() {
    return navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
  }
}

// Create and export a singleton instance
const shareService = new ShareService();
export default shareService;
