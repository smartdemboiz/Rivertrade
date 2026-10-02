'use client';

import { useSyncExternalStore } from 'react';

const AUTH_CHANGE_EVENT = 'rivertrade-auth-change';

function subscribe(onChange) {
  window.addEventListener('storage', onChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  try {
    return `${localStorage.getItem('authToken') || ''}\0${localStorage.getItem('user') || ''}`;
  } catch {
    return '\0';
  }
}

function getServerSnapshot() {
  return '\0';
}

export function persistAuthSession({ token, user }) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user || {}));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function useAuthSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const separator = snapshot.indexOf('\0');
  const token = snapshot.slice(0, separator);
  const serializedUser = snapshot.slice(separator + 1);
  let user = null;

  try {
    user = serializedUser ? JSON.parse(serializedUser) : null;
  } catch {
    user = null;
  }

  return { authenticated: Boolean(token), token: token || null, user };
}