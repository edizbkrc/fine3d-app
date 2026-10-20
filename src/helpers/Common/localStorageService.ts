"use client";

import { LocalStorageKeysEnum } from "@enums/LocalStorageKeysEnum";

import CryptoJS from "crypto-js";

const encryptionKey = "LCxhpjjB2jvkGZGl08yUTrwxVdCtW_2QQkSprS3eJ4I=";

export const localStorageService = {
  setItem: (key: LocalStorageKeysEnum, value: any) => {
    const encryptedValue = CryptoJS.AES.encrypt(
      JSON.stringify(value),
      encryptionKey
    ).toString();
    localStorage?.setItem(key, encryptedValue);
  },
  getItem: (key: LocalStorageKeysEnum): any => {
    try {
      const encryptedValue = localStorage?.getItem(key);
      if (encryptedValue) {
        const bytes = CryptoJS.AES.decrypt(encryptedValue, encryptionKey);
        try {
          return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (error) {
          return null;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  },
  removeItem: (key: LocalStorageKeysEnum) => {
    localStorage?.removeItem(key);
  },
};
