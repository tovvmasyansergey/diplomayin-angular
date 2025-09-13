export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Неверные учетные данные',
    USER_NOT_FOUND: 'Пользователь не найден',
    EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',
    TOKEN_EXPIRED: 'Токен истек',
    TOKEN_INVALID: 'Недействительный токен',
    EMAIL_NOT_VERIFIED: 'Email не подтвержден',
    PASSWORD_TOO_WEAK: 'Пароль слишком слабый',
    PASSWORDS_DO_NOT_MATCH: 'Пароли не совпадают'
  },
  NETWORK: {
    CONNECTION_ERROR: 'Ошибка соединения с сервером',
    TIMEOUT: 'Превышено время ожидания',
    SERVER_ERROR: 'Внутренняя ошибка сервера'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'Поле обязательно для заполнения',
    INVALID_EMAIL: 'Неверный формат email',
    MIN_LENGTH: 'Минимальная длина должна быть',
    MAX_LENGTH: 'Максимальная длина должна быть'
  }
};

