// src/types/tauri.d.ts
interface Api {
  getPatients: () => Promise<any[]>;
  addPatient: (patient: any) => Promise<void>;
  updatePatient: (id: string, patient: any) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
}

interface Window {
  __TAURI__: any;
  __TAURI_INTERNALS__: any;
  api: Api;
}
