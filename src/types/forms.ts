export interface WorkerOption {
  id: string;
  name: string;
}

export interface ServiceOption {
  id: string;
  name: string;
}

export interface FormDefinition {
  formId: string;
  title: string;
  description: string;
  callbackUrl: string;
  workers: WorkerOption[];
  services: ServiceOption[];
  createdAt: number;
}

