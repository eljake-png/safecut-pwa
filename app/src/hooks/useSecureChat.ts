import { useState, useCallback } from 'react';

export const useSecureChat = () => {
  // 1. ГЕНЕРАЦІЯ ПАРИ КЛЮЧІВ (ECDH P-256)
  const generateKeyPair = async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey", "deriveBits"]
    );
  };

  // 2. СПІЛЬНИЙ СЕКРЕТ
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

  // 3. ШИФРУВАННЯ
  const encryptMessage = async (text: string, sharedKey: CryptoKey) => {
    const encodedText = new TextEncoder().encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); 
    
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      sharedKey,
      encodedText
    );

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
        { name: "AES-GCM", iv: iv },
        sharedKey,
        data
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch (e) {
      console.error("Decryption failed:", e);
      // Повертаємо null або спеціальний текст, щоб UI не падав
      throw e; 
    }
  };

  // --- HELPER FUNCTIONS ---

  // Експорт будь-якого ключа в JSON (JWK) для збереження в LocalStorage
  const exportKeyToJWK = async (key: CryptoKey): Promise<JsonWebKey> => {
    return await window.crypto.subtle.exportKey("jwk", key);
  };

  // Імпорт будь-якого ключа з JSON (JWK)
  const importKeyFromJWK = async (jwk: JsonWebKey, type: 'public' | 'private'): Promise<CryptoKey> => {
    return await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      type === 'private' ? ["deriveKey", "deriveBits"] : []
    );
  };

  // Експорт публічного ключа для передачі мережею (SPKI)
  const exportPublicKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return arrayBufferToBase64(new Uint8Array(exported));
  };

  // Імпорт публічного ключа з мережі (SPKI)
  const importPublicKey = async (base64Key: string): Promise<CryptoKey> => {
    const buffer = base64ToArrayBuffer(base64Key);
    return await window.crypto.subtle.importKey(
      "spki",
      buffer,
      { name: "ECDH", namedCurve: "P-256" },
      true,
      []
    );
  };

  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) binary += String.fromCharCode(buffer[i]);
    return window.btoa(binary);
  };

  const base64ToArrayBuffer = (base64: string): Uint8Array => {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary_string.charCodeAt(i);
    return bytes;
  };

  return {
    generateKeyPair,
    deriveSharedKey,
    encryptMessage,
    decryptMessage,
    exportPublicKey,
    importPublicKey,
    exportKeyToJWK,   // Нове
    importKeyFromJWK  // Нове
  };
};