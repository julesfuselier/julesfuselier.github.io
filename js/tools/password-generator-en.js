// SECURE PASSWORD GENERATOR - ENGLISH VERSION
class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.generatePassword(); // Generate default password
    }

    initializeElements() {
        this.lengthSlider = document.getElementById('length');
        this.lengthValue = document.getElementById('lengthValue');
        this.uppercaseCheck = document.getElementById('uppercase');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.numbersCheck = document.getElementById('numbers');
        this.symbolsCheck = document.getElementById('symbols');
        this.excludeSimilarCheck = document.getElementById('excludeSimilar');
        this.generateBtn = document.getElementById('generateBtn');
        this.passwordResult = document.getElementById('passwordResult');
        this.copyBtn = document.getElementById('copyBtn');
        this.strengthMeter = document.getElementById('strengthMeter');
        this.strengthText = document.getElementById('strengthText');
    }

    bindEvents() {
        this.lengthSlider.addEventListener('input', () => {
            this.lengthValue.textContent = this.lengthSlider.value;
            this.generatePassword();
        });

        [this.uppercaseCheck, this.lowercaseCheck, this.numbersCheck, this.symbolsCheck, this.excludeSimilarCheck]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => this.generatePassword());
            });

        this.generateBtn.addEventListener('click', () => this.generatePassword());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
    }

    generatePassword() {
        const length = parseInt(this.lengthSlider.value);
        const options = {
            uppercase: this.uppercaseCheck.checked,
            lowercase: this.lowercaseCheck.checked,
            numbers: this.numbersCheck.checked,
            symbols: this.symbolsCheck.checked,
            excludeSimilar: this.excludeSimilarCheck.checked
        };

        // Check that at least one option is checked
        if (!Object.values(options).slice(0, 4).some(val => val)) {
            this.showError('Please select at least one character type');
            return;
        }

        const password = this.createPassword(length, options);
        this.displayPassword(password);
        this.updateStrengthMeter(password, options);
    }

    createPassword(length, options) {
        let charset = '';
        let guaranteedChars = '';

        // Define character sets
        const charsets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Similar characters to exclude if option is enabled
        const similarChars = '0O1lI|`';

        // Build character set according to options
        Object.keys(charsets).forEach(type => {
            if (options[type]) {
                let chars = charsets[type];
                if (options.excludeSimilar) {
                    chars = chars.split('').filter(char => !similarChars.includes(char)).join('');
                }
                charset += chars;
                // Guarantee at least one character of each selected type
                if (chars.length > 0) {
                    guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
                }
            }
        });

        // Generate the rest of the password
        let password = guaranteedChars;
        for (let i = guaranteedChars.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle password to avoid predictable pattern
        return this.shuffleString(password);
    }

    shuffleString(str) {
        return str.split('').sort(() => Math.random() - 0.5).join('');
    }

    displayPassword(password) {
        this.passwordResult.textContent = password;
        this.copyBtn.style.display = 'inline-block';

        // Generation animation
        this.passwordResult.style.opacity = '0';
        setTimeout(() => {
            this.passwordResult.style.opacity = '1';
        }, 50);
    }

    updateStrengthMeter(password, options) {
        const strength = this.calculateStrength(password, options);
        const percentage = (strength.score / 100) * 100;

        this.strengthMeter.style.width = percentage + '%';
        this.strengthMeter.className = `strength-bar ${strength.level}`;
        this.strengthText.textContent = `Strength: ${strength.label} (${strength.score}/100)`;
    }

    calculateStrength(password, options) {
        let score = 0;
        let level = 'weak';
        let label = 'Weak';

        // Length scoring
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 15;
        if (password.length >= 16) score += 15;

        // Character diversity
        if (options.uppercase) score += 10;
        if (options.lowercase) score += 10;
        if (options.numbers) score += 10;
        if (options.symbols) score += 20;

        // Bonus for excluding similar characters
        if (options.excludeSimilar) score += 5;

        // Bonus for exceptional length
        if (password.length >= 20) score += 5;

        // Determine level
        if (score >= 80) {
            level = 'very-strong';
            label = 'Very Strong';
        } else if (score >= 60) {
            level = 'strong';
            label = 'Strong';
        } else if (score >= 40) {
            level = 'medium';
            label = 'Medium';
        } else if (score >= 20) {
            level = 'weak';
            label = 'Weak';
        } else {
            level = 'very-weak';
            label = 'Very Weak';
        }

        return { score: Math.min(score, 100), level, label };
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.passwordResult.textContent);
            this.showSuccess('Password copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopy();
        }
    }

    fallbackCopy() {
        const textArea = document.createElement('textarea');
        textArea.value = this.passwordResult.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            this.showSuccess('Password copied to clipboard!');
        } catch (err) {
            this.showError('Could not copy password');
        }
        document.body.removeChild(textArea);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Show animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto removal
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize generator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});