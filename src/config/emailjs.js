// EmailJS Configuration
// Replace these with your actual EmailJS credentials from https://www.emailjs.com/

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID',        // Replace with your EmailJS Service ID
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID',      // Replace with your EmailJS Template ID  
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY'         // Replace with your EmailJS Public Key
};

// Instructions to set up EmailJS:
// 1. Go to https://www.emailjs.com/
// 2. Create a free account
// 3. Add your Gmail (or any email service)
// 4. Create a service and get SERVICE_ID
// 5. Create an email template with these variables:
//    - {{to_email}}
//    - {{to_name}}
//    - {{company_name}}
//    - {{status}}
//    - {{message}}
//    - {{from_name}}
// 6. Get TEMPLATE_ID from the template
// 7. Get PUBLIC_KEY from Account > API Keys
// 8. Replace the values above with your actual credentials

// Sample Email Template:
/*
Subject: Application Status Update - {{company_name}}

Hi {{to_name}},

Your placement application status has been updated.

{{message}}

Company: {{company_name}}
Status: {{status}}

Please check the placement portal for more details.

Best regards,
{{from_name}}
Placement Cell
*/
