document.addEventListener('DOMContentLoaded', function() {
    // Referencias del DOM
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    const fields = {
        name: document.getElementById('name'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email'),
        message: document.getElementById('message')
    };

    const errorElements = {
        name: document.getElementById('nameGroup'),
        phone: document.getElementById('phoneGroup'),
        email: document.getElementById('emailGroup')
    };

    let isSubmitting = false;
    let hasAttemptedSubmit = false;

    // Validadores simples
    const validators = {
        name: (value) => value.trim().length > 0,
        
        phone: (value) => {
            const cleanPhone = value.replace(/\D/g, '');
            return cleanPhone.length >= 8 && cleanPhone.length <= 15; // Mínimo 8 dígitos
        },
        
        email: (value) => {
            const trimmed = value.trim();
            if (!trimmed) return true;
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        }
    };

    // Manejo de errores visuales
    function showError(fieldName) {
        const errorEl = errorElements[fieldName];
        if (errorEl) {
            errorEl.classList.add('c-form__group--error');
            fields[fieldName].classList.add('c-form__input--error');
        }
    }

    function clearError(fieldName) {
        const errorEl = errorElements[fieldName];
        if (errorEl) {
            errorEl.classList.remove('c-form__group--error');
            fields[fieldName].classList.remove('c-form__input--error');
        }
    }

    function validateForm() {
        let isValid = true;

        // Validar nombre
        if (!validators.name(fields.name.value)) {
            if (hasAttemptedSubmit) showError('name');
            isValid = false;
        } else {
            clearError('name');
        }

        // Validar teléfono
        if (!validators.phone(fields.phone.value)) {
            if (hasAttemptedSubmit) showError('phone');
            isValid = false;
        } else {
            clearError('phone');
        }

        // Validar email solo si tiene contenido
        const emailValue = fields.email.value.trim();
        if (emailValue && !validators.email(emailValue)) {
            if (hasAttemptedSubmit) showError('email');
            isValid = false;
        } else {
            clearError('email');
        }

        return isValid;
    }

    // UI States
    function showLoading() {
        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        submitBtn.classList.add('c-btn--loading');
        hideErrorMessage();
    }

    function hideLoading() {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Consulta';
        submitBtn.classList.remove('c-btn--loading');
    }

    function showSuccess() {
        successMessage.classList.add('c-form__success-message--active');
        form.classList.add('c-form--hidden');
        hideErrorMessage();
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(resetForm, 5000);
    }

    function showErrorMessage(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.add('c-form__error-message--active');
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function hideErrorMessage() {
        if (errorMessage) {
            errorMessage.classList.remove('c-form__error-message--active');
        }
    }

    function resetForm() {
        successMessage.classList.remove('c-form__success-message--active');
        form.classList.remove('c-form--hidden');
        hideErrorMessage();
        
        Object.keys(fields).forEach(fieldName => {
            fields[fieldName].value = '';
            clearError(fieldName);
        });
        
        hasAttemptedSubmit = false;
        hideLoading();
    }

    function buildFormData() {
        const emailValue = fields.email.value.trim();
        const messageValue = fields.message.value.trim();

        return {
            name: fields.name.value.trim(),
            phone: fields.phone.value.trim(),
            message: messageValue || 'Sin mensaje específico',
            email: emailValue || 'sin-email@contactform.com', // Debe ser formato email válido
            recipientEmail: 'bruna.ceppa@solcre.com'
        };
    }

    // Envío a AWS Lambda
    async function submitForm(formData, fetchImpl = window.fetch) {
        try {
            const response = await fetchImpl('https://r7qiluozhisfq3e3owq7e2vbga0kuvvd.lambda-url.us-east-1.on.aws/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                // Intentar obtener más detalles del error
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = errorData.message || errorData.error || 'Error del servidor';
                } catch (e) {
                    const errorText = await response.text();
                    errorDetails = errorText || 'Error desconocido';
                }
                throw new Error(`Error ${response.status}: ${errorDetails}`);
            }

            const result = await response.json();
             
            // Si llegamos aquí con status 200, es éxito
            if (response.status === 200) {
                showSuccess();
            } else {
                throw new Error(result.message || result.error || 'Error desconocido');
            }
        } catch (error) {
            showErrorMessage(`Error al enviar el formulario: ${error.message}`);
            hideLoading();
        }
    }

    // Event handlers
    async function handleSubmit(event) {
        event.preventDefault();
        
        if (isSubmitting) return;
        
        hasAttemptedSubmit = true;
        
        if (!validateForm()) {
            const firstError = document.querySelector('.c-form__group--error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        showLoading();
        const formData = buildFormData();
        await submitForm(formData);
    }

    // Formateo de teléfono en tiempo real
    function formatPhone(value) {
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length <= 4) return cleanValue;
        if (cleanValue.length <= 7) {
            return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4)}`;
        }
        return `${cleanValue.slice(0, 4)} ${cleanValue.slice(4, 7)} ${cleanValue.slice(7, 11)}`;
    }

    // Event listeners
    if (form) {
        form.addEventListener('submit', handleSubmit);

        // Limpiar errores al escribir
        ['name', 'phone', 'email'].forEach(fieldName => {
            fields[fieldName].addEventListener('input', () => {
                if (errorElements[fieldName] && errorElements[fieldName].classList.contains('c-form__group--error')) {
                    clearError(fieldName);
                }
            });
        });

        // Formateo de teléfono
        fields.phone.addEventListener('input', (event) => {
            event.target.value = formatPhone(event.target.value);
        });
    }
});