import { invoke } from '@tauri-apps/api/core';

// Tipagem básica para os retornos
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const api = {
  auth: {
    login: async (data: any) => {
      // Chama o comando 'login' lá no Rust (criaremos na Fase 3)
      return await invoke<ApiResponse<any>>('login', { payload: data });
    },
    register: async (data: any) => {
      return await invoke<ApiResponse<any>>('register', { payload: data });
    }
  },

  patients: {
    create: async (data: any) => {
      return await invoke<ApiResponse<any>>('create_patient', { payload: data });
    },
    list: async (userId: string) => {
      return await invoke<ApiResponse<any>>('list_patients', { userId });
    },
    delete: async (id: string, userId: string) => {
      return await invoke<ApiResponse<any>>('delete_patient', { id, userId });
    },
    update: async (id: string, userId: string, data: any) => {
      return await invoke<ApiResponse<any>>('update_patient', { id, userId, data });
    }
  },

  settings: {
    get: async (userId: string) => {
      return await invoke<ApiResponse<any>>('get_settings', { userId });
    },
    update: async (userId: string, data: any) => {
      return await invoke<ApiResponse<any>>('update_settings', { userId, data });
    }
  }
};