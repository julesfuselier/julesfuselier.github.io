// GÉNÉRATEUR QR CODE AVANCÉ
class QRCodeGenerator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.currentQRCode = null;
    }

    initializeElements() {
        this.textInput = document.getElementById('qrText');
        this.typeSelect = document.getElementById('qrType');
        this.sizeSelect = document.getElementById('qrSize');
        this.colorPicker = document.getElementById('qrColor');
        this.bgColorPicker = document.getElementById('qrBgColor');
        this.generateBtn = document.getElementById('generateQRBtn');
        this.qrResult = document.getElementById('qrResult');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyQRBtn');

        // Templates spécialisés
        this.urlTemplate = document.getElementById('urlTemplate');
        this.wifiTemplate = document.getElementById('wifiTemplate');
        this.contactTemplate = document.getElementById('contactTemplate');
        this.emailTemplate = document.getElementById('emailTemplate');
    }

    bindEvents() {
        this.typeSelect.addEventListener('change', () => this.handleTypeChange());
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());
        this.copyBtn.addEventListener('click', () => this.copyQRCode());

        // Auto-génération en temps réel
        [this.textInput, this.sizeSelect, this.colorPicker, this.bgColorPicker].forEach(element => {
            element.addEventListener('input', () => {
                if (this.textInput.value.trim()) {
                    this.generateQRCode();
                }
            });
        });

        // Templates events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('template-btn')) {
                this.useTemplate(e.target.dataset.template);
            }
        });
    }

    handleTypeChange() {
        const type = this.typeSelect.value;

        // Masquer tous les templates
        document.querySelectorAll('.template-section').forEach(section => {
            section.style.display = 'none';
        });

        // Afficher le template approprié
        const templateSection = document.getElementById(type + 'Template');
        if (templateSection) {
            templateSection.style.display = 'block';
        }

        // Réinitialiser le champ texte
        this.textInput.value = '';
        this.clearResult();
    }

    useTemplate(templateType) {
        let content = '';

        switch(templateType) {
            case 'website':
                content = document.getElementById('websiteUrl').value;
                break;
            case 'wifi':
                const ssid = document.getElementById('wifiSSID').value;
                const password = document.getElementById('wifiPassword').value;
                const security = document.getElementById('wifiSecurity').value;
                content = `WIFI:T:${security};S:${ssid};P:${password};;`;
                break;
            case 'contact':
                const name = document.getElementById('contactName').value;
                const phone = document.getElementById('contactPhone').value;
                const email = document.getElementById('contactEmail').value;
                content = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
                break;
            case 'email':
                const emailTo = document.getElementById('emailTo').value;
                const subject = document.getElementById('emailSubject').value;
                const body = document.getElementById('emailBody').value;
                content = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                break;
        }

        this.textInput.value = content;
        if (content) {
            this.generateQRCode();
        }
    }

    async generateQRCode() {
        const text = this.textInput.value.trim();
        if (!text) {
            this.showError('Veuillez entrer du texte ou une URL');
            return;
        }

        try {
            // Utilisation de l'API QR-Code gratuite
            const size = this.sizeSelect.value;
            const color = this.colorPicker.value.replace('#', '');
            const bgColor = this.bgColorPicker.value.replace('#', '');

            // API QR Server (gratuite et fiable)
            const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bgColor}&format=png&ecc=M`;

            // Créer l'image
            const img = document.createElement('img');
            img.src = apiUrl;
            img.alt = 'QR Code généré';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '8px';
            img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';

            // Afficher le résultat
            this.qrResult.innerHTML = '';
            this.qrResult.appendChild(img);

            // Stocker pour téléchargement
            this.currentQRCode = {
                url: apiUrl,
                text: text,
                size: size
            };

            // Afficher les boutons d'action
            this.downloadBtn.style.display = 'inline-block';
            this.copyBtn.style.display = 'inline-block';

            // Analytics tracking
            if (typeof trackToolUsage === 'function') {
                trackToolUsage('qr_code_generator', 'generate');
            }

            this.showSuccess('QR Code généré avec succès !');

        } catch (error) {
            this.showError('Erreur lors de la génération du QR Code');
            console.error('QR Code generation error:', error);
        }
    }

    async downloadQRCode() {
        if (!this.currentQRCode) return;

        try {
            const response = await fetch(this.currentQRCode.url);
            const blob = await response.blob();

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `qrcode-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Analytics tracking
            if (typeof trackDownload === 'function') {
                trackDownload(`qrcode-${Date.now()}.png`, 'qr_code_generator');
            }

            this.showSuccess('QR Code téléchargé !');

        } catch (error) {
            this.showError('Erreur lors du téléchargement');
            console.error('Download error:', error);
        }
    }

    async copyQRCode() {
        if (!this.currentQRCode) return;

        try {
            // Copier l'URL de l'image ou le texte selon la préférence
            await navigator.clipboard.writeText(this.currentQRCode.url);

            // Analytics tracking
            if (typeof trackCopy === 'function') {
                trackCopy('qr_code_generator', 'image_url');
            }

            this.showSuccess('Lien du QR Code copié !');

        } catch (error) {
            this.showError('Impossible de copier');
            console.error('Copy error:', error);
        }
    }

    clearResult() {
        this.qrResult.innerHTML = '';
        this.downloadBtn.style.display = 'none';
        this.copyBtn.style.display = 'none';
        this.currentQRCode = null;
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
        }, 3000);
    }
}

// Initialiser le générateur QR Code
document.addEventListener('DOMContentLoaded', () => {
    new QRCodeGenerator();
});