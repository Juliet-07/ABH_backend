import { Injectable } from '@nestjs/common';

@Injectable()
export class HelpersService {
    public genCode(len = 9) {
        let d = new Date().getFullYear().toString().substr(-2);
        d += this.daysIntoYear();
        if (len - d.length > 0) {
            return d + this.genString(len - d.length);
        }
        return this.genString(len);
    }

    private genString(length, possible = '') {
        let text = '';
        const str = possible || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < length; i++) {
            text += str.charAt(Math.floor(Math.random() * str.length));
        }
        return text;
    }

    hasCodeExpired(time) {
        return new Date().toUTCString() > new Date(time).toUTCString();
    }

    private daysIntoYear(date = new Date()) {
        // eslint-disable-next-line max-len
        return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    }

    public generateVerificationCode() {
        const token = `${this.generateOtp()}`;
        // set expire=y date
        const expiresIn = new Date(Date.now() + 25 * 60 * 1000).toISOString();
        return { token, expiresIn };
    }

    public generate2FACode() {
        const token = this.generateOtp();
        // set expire=y date
        const expiresIn = Date.now() + 10 * 60 * 1000;
        return { token, expiresIn };
    }

    private generateOtp(length = 5) {
        if (length < 1) return;
        const _exponent = Math.pow(10, length - 1)
        const num = Math.floor(Math.random() * (9 * _exponent)) + _exponent;
        return num;
    }
}
