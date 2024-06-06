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

    public genString(length, possible = '') {
        let text = '';
        const str = possible || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < length; i++) {
            text += str.charAt(Math.floor(Math.random() * str.length));
        }
        return text;
    }

    public generateDefaultPassword (length) {
            // Ensure the minimum length is at least 10
            length = Math.max(length, 10);
        
            // Regex pattern explanation:
            // (?=.*\d) - at least one digit
            // (?=.*\W+) - or at least one non-word character
            // (?![.\n]) - does not contain a dot or a newline
            // (?=.*[A-Z]) - at least one uppercase letter
            // (?=.*[a-z]) - at least one lowercase letter
            // .* - zero or more of any character except newline
        
            const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
            const digits = '0123456789';
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'; // Define your non-word characters here
        
            function getRandomChar(chars) {
                return chars[Math.floor(Math.random() * chars.length)];
            }
        
            // Ensure the string contains at least one uppercase letter, one lowercase letter, and one digit or special character
            let result = getRandomChar(uppercaseLetters) + getRandomChar(lowercaseLetters);
        
            // Randomly decide between adding a digit or a special character
            result += Math.random() > 0.5 ? getRandomChar(digits) : getRandomChar(specialChars);
        
            // Add random characters to meet the specified length requirement
            while (result.length < length) {
                const allChars = uppercaseLetters + lowercaseLetters + digits + specialChars;
                result += getRandomChar(allChars);
            }
        
            // Shuffle the result to avoid predictable patterns
            result = result.split('').sort(() => 0.5 - Math.random()).join('');
        
            return result;
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

    public convertProductNameToSlug(productName: string) {
       return productName.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s/g, '-').toLowerCase();
    }
}
