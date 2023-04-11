export type ProjectStatus = string;

export interface Project {
  id: string;
  clientEmail: string;
  createdTime: Date;
  estimatedDeliveryDate: Date;
  inquiryDate: Date;
  projectImage: string;
  projectName: string;
  quantity: number;
  shipDate: Date;
  shippingMethod: string;
  shippingStatus: string;
  status: ProjectStatus;
  targetProductionCompletionDate: Date;
  targetSampleCompletionDate: Date;
  unitPrice: number;
}
