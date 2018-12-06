import { ISendCodeResponse } from '../interfaces/ISendCodeResponse';
import axios from 'axios';
import PhoneNumber from 'awesome-phonenumber';
import { IVerifyCodeResponse } from '../interfaces/IVerifyCodeResponse';
import { Environment } from '../types/environments';
import { ApplicationConfig } from './config';

const MockSendCodeResponse: ISendCodeResponse = {
    message: 'hello',
    seconds_to_expire: 599,
    uuid: 'hello',
    success: true
};

export class PhoneVerifier {
    private readonly endpoint: string = 'https://api.authy.com/protected/json';

    constructor(private phoneNumber: string) { }

    public async sendCode(): Promise<ISendCodeResponse> {
        if (ApplicationConfig.nodeEnv === Environment.local) {
            return MockSendCodeResponse;
        }

        const response = await axios.post<ISendCodeResponse>(`${this.endpoint}/phones/verification/start`, {
            via: 'sms',
            phone_number: this.phoneNumber,
            country_code: '1',
            code_length: '4',
            locale: 'en'
        }, {
                headers: { 'X-Authy-API-Key': ApplicationConfig.twilioKey },
            }).then(res => res.data);
        return response;
    }

    public async verifyCode(code: string): Promise<IVerifyCodeResponse> {
        if (ApplicationConfig.nodeEnv === Environment.local) {
            return this.isLocallyVerified(code) ?
                { success: true, message: 'You did it!' } : { success: false, message: 'Invalid local code. Should be all 0s' };
        }
        const response = await axios.get<IVerifyCodeResponse>(`${this.endpoint}/phones/verification/check`, {
            headers: { 'X-Authy-API-Key': ApplicationConfig.twilioKey },
            params: {
                'phone_number': this.phoneNumber,
                'verification_code': code,
                'country_code': 1
            }
        }).then(res => res.data);
        return response;
    }

    private isLocallyVerified(code: string): boolean {
        for (const char of code) {
            if (char !== '0') {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns the e164 formatted version of phone number. Null if invalid
     * @param phone the phone number to validate
     */
    public static getValidPhoneNumber(phone: string): string | null {
        const phoneNum = new PhoneNumber(phone, 'US');
        if (!phoneNum.isValid() && (ApplicationConfig.nodeEnv !== Environment.local && phoneNum.getType() !== 'unknown')) {
            return null;
        }
        return phoneNum.getNumber('e164');
    }
}