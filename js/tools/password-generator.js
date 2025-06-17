// GÉNÉRATEUR DE MOT DE PASSE SÉCURISÉ
class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.generatePassword(); // Génère un mot de passe par défaut
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

        // Vérifier qu'au moins une option est cochée
        if (!Object.values(options).slice(0, 4).some(val => val)) {
            this.showError('Veuillez sélectionner au moins un type de caractère');
            return;
        }

        const password = this.createPassword(length, options);
        this.displayPassword(password);
        this.updateStrengthMeter(password, options);
    }

    createPassword(length, options) {
        let charset = '';
        let guaranteedChars = '';

        // Définir les jeux de caractères
        const charsets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Caractères similaires à exclure si l'option est activée
        const similarChars = '0O1lI|`';

        // Construire le jeu de caractères selon les options
        Object.keys(charsets).forEach(type => {
            if (options[type]) {
                let chars = charsets[type];
                if (options.excludeSimilar) {
                    chars = chars.split('').filter(char => !similarChars.includes(char)).join('');
                }
                charset += chars;
                // Garantir au moins un caractère de chaque type sélectionné
                if (chars.length > 0) {
                    guaranteedChars += chars[Math.floor(Math.random() * chars.length)];
                }
            }
        });

        // Générer le reste du mot de passe
        let password = guaranteedChars;
        for (let i = guaranteedChars.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Mélanger le mot de passe pour éviter un pattern prévisible
        return this.shuffleString(password);
    }

    shuffleString(str) {
        return str.split('').sort(() => Math.random() - 0.5).join('');
    }

    displayPassword(password) {
        this.passwordResult.textContent = password;
        this.copyBtn.style.display = 'inline-block';

        // Animation de génération
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
        this.strengthText.textContent = `Force: ${strength.label} (${strength.score}/100)`;
    }

    calculateStrength(password, options) {
        let score = 0;
        let level = 'weak';
        let label = 'Faible';

        // Longueur
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 15;
        if (password.length >= 16) score += 15;

        // Diversité des caractères
        if (options.uppercase) score += 10;
        if (options.lowercase) score += 10;
        if (options.numbers) score += 10;
        if (options.symbols) score += 20;

        // Bonus pour exclusion de caractères similaires
        if (options.excludeSimilar) score += 5;

        // Bonus pour longueur exceptionnelle
        if (password.length >= 20) score += 5;

        // Déterminer le niveau
        if (score >= 80) {
            level = 'very-strong';
            label = 'Très Fort';
        } else if (score >= 60) {
            level = 'strong';
            label = 'Fort';
        } else if (score >= 40) {
            level = 'medium';
            label = 'Moyen';
        } else if (score >= 20) {
            level = 'weak';
            label = 'Faible';
        } else {
            level = 'very-weak';
            label = 'Très Faible';
        }

        return { score: Math.min(score, 100), level, label };
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.passwordResult.textContent);
            this.showSuccess('Mot de passe copié !');
        } catch (err) {
            // Fallback pour les navigateurs plus anciens
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
            this.showSuccess('Mot de passe copié !');
        } catch (err) {
            this.showError('Impossible de copier');
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
        // Supprimer les notifications existantes
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animation d'apparition
        setTimeout(() => notification.classList.add('show'), 10);

        // Suppression automatique
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialiser le générateur quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});