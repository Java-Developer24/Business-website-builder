import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimistic<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      optimisticUpdate: () => void,
      apiCall: () => Promise<T>,
      rollback: () => void,
      options: OptimisticOptions<T> = {}
    ) => {
      setIsLoading(true);
      setError(null);

      // Apply optimistic update immediately
      optimisticUpdate();

      try {
        // Execute API call
        const result = await apiCall();

        // Show success message if provided
        if (options.successMessage) {
          toast.success(options.successMessage);
        }

        // Call success callback
        if (options.onSuccess) {
          options.onSuccess(result);
        }

        return result;
      } catch (err) {
        // Rollback optimistic update
        rollback();

        const error = err instanceof Error ? err : new Error('An error occurred');
        setError(error);

        // Show error message
        const errorMessage = options.errorMessage || error.message;
        toast.error(errorMessage);

        // Call error callback
        if (options.onError) {
          options.onError(error);
        }

        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { execute, isLoading, error };
}

// Example usage:
// const { execute } = useOptimistic();
//
// const handleDelete = async (id: number) => {
//   const originalItems = [...items];
//
//   await execute(
//     () => setItems(items.filter(item => item.id !== id)), // Optimistic update
//     () => fetch(`/api/items/${id}`, { method: 'DELETE' }), // API call
//     () => setItems(originalItems), // Rollback
//     {
//       successMessage: 'Item deleted successfully',
//       errorMessage: 'Failed to delete item'
//     }
//   );
// };
