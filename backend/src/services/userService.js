'use strict';

const userRepository = require('../repositories/userRepository');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,128}$/;
const VALID_THEMES = ['LIGHT', 'DARK'];
const VALID_LANGUAGES = ['ko', 'en'];

function makeError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw makeError('인증 정보가 유효하지 않습니다.', 401, 'AUTH_USER_DELETED');
  }
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    theme: user.theme,
    language: user.language,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

async function updateMe(userId, { name, currentPassword, newPassword }) {
  const trimmedName = name !== undefined ? name.trim() : undefined;

  if (trimmedName === undefined && newPassword === undefined) {
    throw makeError('변경할 항목이 없습니다.', 400, 'VALIDATION_ERROR');
  }

  if (trimmedName !== undefined && (trimmedName.length < 1 || trimmedName.length > 50)) {
    throw makeError('이름은 1~50자여야 합니다.', 400, 'VALIDATION_ERROR');
  }

  let passwordHash;
  if (newPassword !== undefined) {
    if (!currentPassword) {
      throw makeError('현재 비밀번호를 입력해야 합니다.', 400, 'VALIDATION_ERROR');
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw makeError('인증 정보가 유효하지 않습니다.', 401, 'AUTH_USER_DELETED');
    }

    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      throw makeError('현재 비밀번호가 올바르지 않습니다.', 401, 'AUTH_PASSWORD_MISMATCH');
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw makeError('비밀번호는 8~128자이며 영문과 숫자를 각 1자 이상 포함해야 합니다.', 400, 'AUTH_PASSWORD_WEAK');
    }

    passwordHash = await hashPassword(newPassword);
  }

  const updated = await userRepository.update(userId, { name: trimmedName, passwordHash });
  return { id: updated.id, email: updated.email, name: updated.name };
}

async function updateSettings(userId, { theme, language }) {
  if (theme === undefined && language === undefined) {
    throw makeError('theme 또는 language 중 적어도 하나를 포함해야 합니다.', 400, 'VALIDATION_ERROR');
  }
  if (theme !== undefined && !VALID_THEMES.includes(theme)) {
    throw makeError('theme은 LIGHT 또는 DARK만 허용됩니다.', 400, 'VALIDATION_ERROR');
  }
  if (language !== undefined && !VALID_LANGUAGES.includes(language)) {
    throw makeError('language는 ko 또는 en만 허용됩니다.', 400, 'VALIDATION_ERROR');
  }
  const updated = await userRepository.updateSettings(userId, { theme, language });
  return { theme: updated.theme, language: updated.language };
}

async function deleteMe(userId) {
  await userRepository.deleteById(userId);
  return {};
}

module.exports = { getMe, updateMe, updateSettings, deleteMe };
