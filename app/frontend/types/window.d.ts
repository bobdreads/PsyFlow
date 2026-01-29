export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (data: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
        register: (data: any) => Promise<any>;
      };
      settings: {
        get: (userId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
        update: (userId: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
      };
      patients: {
        create: (data: any) => Promise<any>;
        list: (userId: string) => Promise<any>;
        delete: (id: string, userId: string) => Promise<any>;
        update: (id: string, userId: string, data: any) => Promise<any>;
      };
    };
  }
}