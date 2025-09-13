@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

.login-container {
    display: flex;
    width: 100vw;
    height: 100vh;
    font-family: 'Poppins', sans-serif;
    background-color: #f4f7fc;
}

.login-branding {
    flex: 1.2;
    background: linear-gradient(135deg, #1e3a8a, #3b82f6);
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.login-branding::before {
    content: '';
    position: absolute;
    top: -50px;
    left: -50px;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
}

.login-branding::after {
    content: '';
    position: absolute;
    bottom: -100px;
    right: -100px;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
}

.branding-content {
    max-width: 450px;
    z-index: 1;
}

.branding-icon {
    font-size: 70px;
    margin-bottom: 24px;
    opacity: 0.9;
    color: #93c5fd;
}

.branding-h1 {
    font-size: 2.8rem;
    margin: 0 0 16px 0;
    font-weight: 700;
    letter-spacing: 1px;
}

.branding-p {
    font-size: 1.1rem;
    line-height: 1.7;
    opacity: 0.9;
}

.login-form-area {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
}

.login-form {
    width: 100%;
    max-width: 400px;
    position: relative;
}

.login-form-h2 {
    color: #1e293b;
    font-size: 2rem;
    font-weight: 600;
    margin-bottom: 8px;
    text-align: left;
}

.form-subtitle {
    color: #64748b;
    margin-bottom: 32px;
    text-align: left;
}

.input-group {
    position: relative;
    margin-bottom: 20px;
}

.input-icon {
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    transition: color 0.3s ease;
}

.input-field {
    width: 100%;
    padding: 14px 45px;
    box-sizing: border-box;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Poppins', sans-serif;
    color: #334155;
    background-color: #f8fafc;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.input-field:focus + .input-icon,
.input-field:focus ~ .password-toggle-icon {
    color: #3b82f6;
}

.password-toggle-icon {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.3s ease;
}

.options-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    font-size: 0.9rem;
}

.remember-me {
    display: flex;
    align-items: center;
    color: #475569;
    cursor: pointer;
}

.remember-me input {
    margin-right: 8px;
    accent-color: #3b82f6;
}

.forgot-password-link {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s;
}

.forgot-password-link:hover {
    color: #1e3a8a;
}

.login-button {
    width: 100%;
    padding: 15px;
    background: #3b82f6;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.login-button:hover:not(:disabled) {
    background-color: #2563eb;
    transform: translateY(-2px);
}

.login-button:disabled {
    background-color: #93c5fd;
    cursor: not-allowed;
}

.error-message {
    color: #dc2626;
    background: #fee2e2;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
    border: 1px solid #fecaca;
}

.loading-overlay {
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10;
    border-radius: 12px;
}

.spinner {
    width: 48px;
    height: 48px;
    border: 5px solid #dbeafe;
    border-bottom-color: #3b82f6;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

.loading-text {
    margin-top: 16px;
    color: #1e3a8a;
    font-size: 1rem;
    font-weight: 500;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}