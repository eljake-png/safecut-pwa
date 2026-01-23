import { useState, useCallback } from 'react';

export const useSecureChat = () => {
  // 1. ГЕНЕРАЦІЯ ПАРИ КЛЮЧІВ (ECDH P-256)
  const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );
    return keyPair;
  };

  // 2. СТВОРЕННЯ СПІЛЬНОГО СЕКРЕТУ (AES-GCM)
  // Це магія: беремо свій приватний + чужий публічний = однаковий секрет у обох
  const deriveSharedKey = async (privateKey: CryptoKey, remotePublicKey: CryptoKey) => {
    return await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: remotePublicKey,
      },
      privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  };

  // 3. ШИФРУВАННЯ (AES-GCM + IV)
  const encryptMessage = async (text: string, sharedKey: CryptoKey) => {
    const encodedText = new TextEncoder().encode(text);
    // IV (Initialization Vector) - випадковий шум, щоб однакові фрази виглядали по-різному
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      sharedKey,
      encodedText
    );

    // Пакуємо IV + Шифротекст в один рядок Base64 для відправки
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv);
    combined.set(encryptedArray, iv.length);

    return arrayBufferToBase64(combined);
  };

  // 4. ДЕШИФРУВАННЯ
  const decryptMessage = async (encryptedBase64: string, sharedKey: CryptoKey) => {
    try {
      const combined = base64ToArrayBuffer(encryptedBase64);
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        sharedKey,
        data
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      console.error("Помилка дешифрування (можливо, невірний ключ):", e);
      return "🔒 Повідомлення не вдалося розшифрувати";
    }
  };

  // --- ДОПОМІЖНІ ФУНКЦІЇ (Для Firebase) ---

  // Експорт ключа в рядок (щоб відправити через інтернет)
  const exportPublicKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return arrayBufferToBase64(new Uint8Array(exported));
  };

  // Імпорт ключа з рядка (коли отримали від співрозмовника)
  const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
    const buffer = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
      "spki",
      buffer,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      []
    );
  };

  // Helpers for Base64 conversion
  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string): Uint8Array => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
  };

  return {
    generateKeyPair,
    deriveSharedKey,
    encryptMessage,
    decryptMessage,
    exportPublicKey,
    importPublicKey
  };
};