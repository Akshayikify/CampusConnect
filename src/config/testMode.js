// Test Mode Configuration
// Set this to true to test the application without EmailJS setup

export const TEST_MODE = {
  enabled: false,  // Set to false when EmailJS is configured
  showTestNotifications: false,  // Show test notifications instead of sending emails
  mockEmailDelay: 1000  // Simulate email sending delay (ms)
};

// Mock email function for testing
export const mockEmailSend = (emailParams) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('📧 Mock Email Sent:', {
        to: emailParams.to_email,
        subject: `Application Status Update - ${emailParams.company_name}`,
        message: emailParams.message,
        status: emailParams.status
      });
      resolve({ status: 200, text: 'Mock email sent successfully' });
    }, TEST_MODE.mockEmailDelay);
  });
};
