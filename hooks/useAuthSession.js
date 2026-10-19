'use client';

import { useEffect, useSyncExternalStore } from 'react';

const AUTH_CHANGE_EVENT = 'rivertrade-auth-change';
const AUTH_HYDRATION_EVENT = 'rivertrade-auth-hydrated';
let refreshRequest = null;
let clientReady = false;

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

function subscribeToHydration(onChange) {
  window.addEventListener(AUTH_HYDRATION_EVENT, onChange);
  return () => window.removeEventListener(AUTH_HYDRATION_EVENT, onChange);
}

function getHydrationSnapshot() {
  return clientReady;
}

function getServerHydrationSnapshot() {
  return false;
}

export function persistAuthSession({ token, user, refreshToken, expiresAt }) {
  localStorage.setItem('authToken', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (expiresAt) localStorage.setItem('authTokenExpiresAt', String(expiresAt));
  localStorage.setItem('user', JSON.stringify(user || {}));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('authTokenExpiresAt');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

async function refreshAuthSession() {
  if (refreshRequest) return refreshRequest;

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  refreshRequest = fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) clearAuthSession();
        return false;
      }
      persistAuthSession(result);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

export async function getAuthToken() {
  const token = localStorage.getItem('authToken');
  const expiresAt = Number(localStorage.getItem('authTokenExpiresAt') || 0);
  const needsRefresh = !token || (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 60);

  if (needsRefresh && localStorage.getItem('refreshToken')) {
    await refreshAuthSession();
  }

  return localStorage.getItem('authToken');
}

export function useAuthSession() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  useEffect(() => {
    clientReady = true;
    window.dispatchEvent(new Event(AUTH_HYDRATION_EVENT));
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

    const refreshIfNeeded = async () => {
      const expiresAt = Number(localStorage.getItem('authTokenExpiresAt') || 0);
      if (!localStorage.getItem('authToken')
        || (expiresAt && expiresAt <= Math.floor(Date.now() / 1000) + 60)) {
        await refreshAuthSession();
      }
    };

    void refreshIfNeeded();
    const timer = window.setInterval(refreshIfNeeded, 30_000);
    return () => window.clearInterval(timer);
  }, [ready, snapshot]);

  const separator = snapshot.indexOf('\0');
  const token = snapshot.slice(0, separator);
  const serializedUser = snapshot.slice(separator + 1);
  let user = null;

  try {
    user = serializedUser ? JSON.parse(serializedUser) : null;
  } catch {
    user = null;
  }

  return { authenticated: Boolean(token), token: token || null, user, ready };
}