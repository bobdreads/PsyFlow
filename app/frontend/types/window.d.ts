export {};

declare global {
  interface Window {
    api: {
      auth: {
        login: (data: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
        register: (data: any) => Promise<any>;
      };
    };
  }
}