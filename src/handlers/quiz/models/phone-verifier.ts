import { ISendCodeResponse } from '../interfaces/ISendCodeResponse';
import * as fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import { URLSearchParams } from 'url';
import { IVerifyCodeResponse } from '../interfaces/IVerifyCodeResponse';
import { Environment } from '../types/environments';
import { ApplicationConfig } from '../../../config';

const MockSendCodeResponse: ISendCodeResponse = {
    message: 'hello',
    seconds_to_expire: 599,
    uuid: 'hello',
    success: true
};

export class PhoneVerifier {
    private readonly endpoint: string = 'https://api.authy.com/protected/json';
    public static readonly LocalVerificationCode = '0000000';

    constructor(private phoneNumber: string) { }

    public async sendCode(): Promise<ISendCodeResponse> {
        if (process.env.NODE_ENV === Environment.local) {
            return MockSendCodeResponse;
        }
        const params = new URLSearchParams();
        params.append('via', 'sms');
        params.append('phone_number', this.phoneNumber);
        params.append('country_code', '1');
        params.append('code_length', '4');
        params.append('locale', 'en');

        const response = await fetch(`${this.endpoint}/phones/verification/start`, {
            method: 'post',
            headers: { 'X-Authy-API-Key': ApplicationConfig.twilioKey },
            body: params
        }).then(res => res.json());
        return response as ISendCodeResponse;
    }

    public async verifyCode(code: string): Promise<IVerifyCodeResponse> {
        if (code === PhoneVerifier.LocalVerificationCode) {
            return { success: true, message: 'You did it!' };
        }
        const queryParams = `?phone_number=${this.phoneNumber}&verification_code=${code}&country_code=${1}`;
        const response = await fetch(`${this.endpoint}/phones/verification/check${queryParams}`, {
            headers: { 'X-Authy-API-Key': ApplicationConfig.twilioKey }
        }).then(res => res.json());
        return response as IVerifyCodeResponse;
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