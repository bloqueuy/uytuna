document.addEventListener('DOMContentLoaded', function() {
    // Referencias del DOM
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    const fields = {
        name: document.getElementById('name'),
        company: document.getElementById('company'),
        phone: document.getElementById('phone'),
        email: document.getElementById('email'),
        message: document.getElementById('message'),
        terms: document.getElementById('check')
    };

    const errorElements = {
        name: document.getElementById('nameGroup'),
        company: document.getElementById('companyGroup') || fields.company?.closest('.c-form__group'),
        phone: document.getElementById('phoneGroup'),
        email: document.getElementById('emailGroup'),
        terms: fields.terms?.closest('.c-form__checkbox-wrapper')
    };

    let isSubmitting = false;
    let hasAttemptedSubmit = false;

    // Validadores simples
    const validators = {
        name: (value) => value.trim().length > 0,
        
        company: (value) => value.trim().length > 0,
        
        phone: (value) => {
            const cleanPhone = value.replace(/\D/g, '');
            return cleanPhone.length >= 8 && cleanPhone.length <= 15; // Mínimo 8 dígitos
        },
        
        email: (value) => {
            const trimmed = value.trim();
            if (!trimmed) return false; // Email es requerido
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        },
        
        terms: (checked) => checked === true
    };

    // Manejo de errores visuales
    function showError(fieldName) {
        const errorEl = errorElements[fieldName];
        const field = fields[fieldName];
        
        if (!errorEl || !field) return;
        
        if (fieldName === 'terms') {
            // Para el checkbox, solo agregamos la clase al wrapper
            errorEl.classList.add('c-form__checkbox-wrapper--error');
        } else {
            errorEl.classList.add('c-form__group--error');
            const errorClass = field.tagName === 'TEXTAREA' ? 'c-form__textarea--error' : 'c-form__input--error';
            field.classList.add(errorClass);
        }
    }

    function clearError(fieldName) {
        const errorEl = errorElements[fieldName];
        const field = fields[fieldName];
        
        if (!errorEl || !field) return;
        
        if (fieldName === 'terms') {
            // Para el checkbox, solo removemos la clase del wrapper
            errorEl.classList.remove('c-form__checkbox-wrapper--error');
        } else {
            errorEl.classList.remove('c-form__group--error');
            const errorClass = field.tagName === 'TEXTAREA' ? 'c-form__textarea--error' : 'c-form__input--error';
            field.classList.remove(errorClass);
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

        // Validar empresa
        if (!validators.company(fields.company.value)) {
            if (hasAttemptedSubmit) showError('company');
            isValid = false;
        } else {
            clearError('company');
        }

        // Validar teléfono
        if (!validators.phone(fields.phone.value)) {
            if (hasAttemptedSubmit) showError('phone');
            isValid = false;
        } else {
            clearError('phone');
        }

        // Validar email (requerido)
        const emailValue = fields.email.value.trim();
        if (!validators.email(emailValue)) {
            if (hasAttemptedSubmit) showError('email');
            isValid = false;
        } else {
            clearError('email');
        }

        // Validar términos y condiciones
        if (!validators.terms(fields.terms.checked)) {
            if (hasAttemptedSubmit) showError('terms');
            isValid = false;
        } else {
            clearError('terms');
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
        hideErrorMessage();
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Limpiar los campos del formulario
        Object.keys(fields).forEach(fieldName => {
            if (fieldName === 'terms') {
                fields[fieldName].checked = false;
            } else {
                fields[fieldName].value = '';
            }
            clearError(fieldName);
        });
        
        hasAttemptedSubmit = false;
        hideLoading();

        // Ocultar el mensaje de éxito después de 5 segundos
        setTimeout(() => {
            successMessage.classList.remove('c-form__success-message--active');
        }, 5000);
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
        hideErrorMessage();
        
        Object.keys(fields).forEach(fieldName => {
            if (fieldName === 'terms') {
                fields[fieldName].checked = false;
            } else {
                fields[fieldName].value = '';
            }
            clearError(fieldName);
        });
        
        hasAttemptedSubmit = false;
        hideLoading();
    }

    // Envío a AWS Lambda
    async function submitForm() {
        const emailValue = fields.email.value.trim();
        const messageValue = fields.message.value.trim();
        
        const formData = {
            fullname: fields.name.value.trim(),
            company: fields.company.value.trim(),
            phone: fields.phone.value.trim(),
            email: emailValue,
            message: messageValue || ''
        };



        try {
            const response = await fetch('https://r7qiluozhisfq3e3owq7e2vbga0kuvvd.lambda-url.us-east-1.on.aws/api/contact/tuna', {
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
            const firstError = document.querySelector('.c-form__group--error, .c-form__checkbox-wrapper--error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        showLoading();
        await submitForm();
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
        ['name', 'company', 'phone', 'email'].forEach(fieldName => {
            if (fields[fieldName]) {
                fields[fieldName].addEventListener('input', () => {
                    if (errorElements[fieldName]) {
                        const hasError = fieldName === 'terms' 
                            ? errorElements[fieldName].classList.contains('c-form__checkbox-wrapper--error')
                            : errorElements[fieldName].classList.contains('c-form__group--error');
                        if (hasError) {
                            clearError(fieldName);
                        }
                    }
                });
            }
        });

        // Limpiar error del checkbox cuando se marca
        if (fields.terms) {
            fields.terms.addEventListener('change', () => {
                if (errorElements.terms && errorElements.terms.classList.contains('c-form__checkbox-wrapper--error')) {
                    clearError('terms');
                }
            });
        }

        // Formateo de teléfono
        if (fields.phone) {
            fields.phone.addEventListener('input', (event) => {
                event.target.value = formatPhone(event.target.value);
            });
        }
    }
});