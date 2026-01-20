import { toast } from 'sonner';

export const notifications = {
  // Success notifications
  success: (message: string) => {
    toast.success(message);
  },

  // Error notifications
  error: (message: string) => {
    toast.error(message);
  },

  // Info notifications
  info: (message: string) => {
    toast.info(message);
  },

  // Warning notifications
  warning: (message: string) => {
    toast.warning(message);
  },

  // Loading notifications with promise
  promise: <T,>(promise: Promise<T>, messages: { loading: string; success: string; error: string }) => {
    return toast.promise(promise, messages);
  },

  // Common success messages
  created: (resource: string) => {
    toast.success(`${resource} created successfully`);
  },

  updated: (resource: string) => {
    toast.success(`${resource} updated successfully`);
  },

  deleted: (resource: string) => {
    toast.success(`${resource} deleted successfully`);
  },

  saved: () => {
    toast.success('Changes saved successfully');
  },

  // Common error messages
  createError: (resource: string) => {
    toast.error(`Failed to create ${resource}`);
  },

  updateError: (resource: string) => {
    toast.error(`Failed to update ${resource}`);
  },

  deleteError: (resource: string) => {
    toast.error(`Failed to delete ${resource}`);
  },

  loadError: (resource: string) => {
    toast.error(`Failed to load ${resource}`);
  },

  networkError: () => {
    toast.error('Network error. Please check your connection.');
  },

  unauthorized: () => {
    toast.error('You are not authorized to perform this action');
  },

  validationError: (message?: string) => {
    toast.error(message || 'Please check your input and try again');
  },
};
