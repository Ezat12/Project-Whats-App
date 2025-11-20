import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

// Initialize Twilio client only if credentials are available
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export class SMSService {
  /**
   * Generate a 6-digit verification code
   */
  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send SMS verification code
   */
  static async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    try {
      // Check if Twilio is configured
      if (!twilioClient || !twilioPhoneNumber) {
        console.log(
          `[DEV MODE] SMS would be sent to ${phoneNumber} with code: ${code}`
        );
        // In development, just log the code
        return true;
      }

      // Send actual SMS in production
      await twilioClient.messages.create({
        body: `Your WhatsApp verification code is: ${code}. Valid for 10 minutes.`,
        from: twilioPhoneNumber,
        to: phoneNumber,
      });

      console.log(`SMS sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send verification code");
    }
  }

  /**
   * Validate phone number format (basic validation)
   */
  static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic validation: starts with + and contains 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber);
  }
}
