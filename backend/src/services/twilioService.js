import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('🔧 Twilio Configuration:');
console.log('Account SID:', accountSid ? `${accountSid.substring(0, 10)}...` : '❌ MISSING');
console.log('Auth Token:', authToken ? '✅ Present' : '❌ MISSING');
console.log('Verify Service SID:', verifyServiceSid ? `${verifyServiceSid.substring(0, 10)}...` : '❌ MISSING');

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send OTP to phone number
 * @param {string} phone - Phone number in E.164 format (e.g., +919876543210)
 * @returns {Promise<object>} - Twilio verification response
 */
export const sendOTP = async (phone) => {
    try {
        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications
            .create({
                to: phone,
                channel: 'sms' // Can also use 'call' for voice OTP
            });

        console.log(`OTP sent to ${phone}, Status: ${verification.status}`);
        
        return {
            success: true,
            status: verification.status,
            to: verification.to
        };
    } catch (error) {
        console.error('Twilio Send OTP Error:', error.message);
        
        // Handle specific Twilio errors
        if (error.code === 60200) {
            throw new Error('Invalid phone number format. Use E.164 format (e.g., +919876543210)');
        } else if (error.code === 60202) {
            throw new Error('Max send attempts reached. Please try again later.');
        } else if (error.code === 20003) {
            throw new Error('Twilio authentication failed. Check your credentials.');
        }
        
        throw new Error(error.message || 'Failed to send OTP');
    }
};

/**
 * Verify OTP code
 * @param {string} phone - Phone number in E.164 format
 * @param {string} code - 6-digit OTP code
 * @returns {Promise<object>} - Verification result
 */
export const verifyOTP = async (phone, code) => {
    try {
        const verificationCheck = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks
            .create({
                to: phone,
                code: code
            });
        
        console.log(`OTP verification for ${phone}, Status: ${verificationCheck.status}`);
        
        return {
            success: verificationCheck.status === 'approved',
            status: verificationCheck.status,
            valid: verificationCheck.valid
        };
    } catch (error) {
        console.error('Twilio Verify OTP Error:', error.message);
        
        // Handle specific Twilio errors
        if (error.code === 60200) {
            throw new Error('Invalid phone number format');
        } else if (error.code === 60202) {
            throw new Error('Max verification attempts reached');
        } else if (error.code === 60203) {
            throw new Error('Max check attempts reached. Request a new OTP.');
        } else if (error.code === 60212) {
            throw new Error('Invalid OTP code. Please try again.');
        }
        
        throw new Error(error.message || 'Failed to verify OTP');
    }
};

/**
 * Check if Twilio is properly configured
 * @returns {boolean}
 */
export const isTwilioConfigured = () => {
    return !!(accountSid && authToken && verifyServiceSid);
};
