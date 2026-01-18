// Функция для определения базового URL бэкенда на основе текущего хоста
function getBackendBaseUrl(): string {
  const hostname = window.location.hostname;

  // Если это localhost или 127.0.0.1, используем localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:7404/';
  }

  // Иначе используем тот же хост, но порт 7404
  return `http://${hostname}:7404/`;
}

export const API_CONSTANTS = {
  BASE_PATH: getBackendBaseUrl(),
  VERSION: 'v1/',
  ENDPOINTS: {
    LOGIN: 'login',
    REGISTER: 'register',
    VERIFY: 'verify',
    CHANGE_PASSWORD: 'change-password',
    SEND_VERIFY_CODE: 'send-verify-code',
    CHECK_CODE: 'check-code',
    SET_FORGOT_PASSWORD_TOKEN: 'set-forgot-password-token',
    IS_VERIFIED: 'is-verified',
    VALIDATE_TOKEN: 'validate-token'
  }
};

export function getBackendUrl(): string {
  return getBackendBaseUrl().replace(/\/$/, ''); // Убираем последний слеш
}

