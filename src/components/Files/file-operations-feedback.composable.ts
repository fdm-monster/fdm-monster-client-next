// File operations feedback composable
// Created by Claude on 2026.01.24

import { ref } from 'vue'
import { useSnackbar } from '@/shared/snackbar.composable'

export interface OperationState {
  isLoading: boolean
  loadingMessage: string
  operationType: 'rename' | 'move' | 'delete' | 'create' | null
}

/**
 * Composable for managing file operation feedback (loading states, notifications)
 */
export function useFileOperationFeedback() {
  const snackbar = useSnackbar()
  const operationState = ref<OperationState>({
    isLoading: false,
    loadingMessage: '',
    operationType: null
  })

  /**
   * Start a file operation with loading state
   */
  const startOperation = (type: OperationState['operationType'], message: string) => {
    operationState.value = {
      isLoading: true,
      loadingMessage: message,
      operationType: type
    }
  }

  /**
   * Complete a file operation successfully
   */
  const completeOperation = (successMessage: string) => {
    operationState.value = {
      isLoading: false,
      loadingMessage: '',
      operationType: null
    }
    // edited by claude on 2026.01.24.16.01
    snackbar.info(successMessage) // Use info() instead of success()
    // End of Claude's edit
  }

  /**
   * Fail a file operation with error
   */
  const failOperation = (errorMessage: string, error?: any) => {
    operationState.value = {
      isLoading: false,
      loadingMessage: '',
      operationType: null
    }
    console.error('File operation failed:', error)
    snackbar.error(errorMessage)
  }

  /**
   * Execute a file operation with automatic feedback handling
   */
  const executeOperation = async <T>(
    operationType: OperationState['operationType'],
    loadingMessage: string,
    successMessage: string,
    operation: () => Promise<T>
  ): Promise<T | null> => {
    try {
      startOperation(operationType, loadingMessage)
      const result = await operation()
      completeOperation(successMessage)
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Operation failed'
      failOperation(errorMsg, error)
      return null
    }
  }

  return {
    operationState,
    startOperation,
    completeOperation,
    failOperation,
    executeOperation
  }
}
