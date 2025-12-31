import { useDialogsStore } from '@/store/dialog.store'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { DialogContextType } from '@/components/Generic/Dialogs/dialog.types'
import { watchEffect } from 'vue'

export function useDialog<
  TDialogName extends DialogName,
  TContext = DialogContextType<TDialogName>,
  TOutput = any
>(dialogId: TDialogName) {
  const dialogStore = useDialogsStore()

  async function openDialog(context?: TContext) {
    const beforeOpenedCallback = dialogStore.getBeforeOpenedCallback(dialogId)
    if (beforeOpenedCallback) {
      await beforeOpenedCallback(context)
    }

    dialogStore.openDialogWithContext(dialogId, context)

    const openedCallback = dialogStore.getOpenedCallback(dialogId)
    if (openedCallback) {
      await openedCallback(context)
    }
  }

  return {
    dialogId,
    dialogStore,
    openDialog,
    context: () => dialogStore.getContext(dialogId) as TContext,
    closeDialog: (output?: TOutput) => dialogStore.closeDialog(dialogId, output),
    isDialogOpened: () => dialogStore.isDialogOpened(dialogId),
    handleAsync: async (input: TContext): Promise<TOutput> => {
      await openDialog(input)

      return new Promise<TOutput>((resolve) => {
        watchEffect(() => {
          if (!dialogStore.isDialogOpened(dialogId)) {
            resolve(dialogStore.getOutput(dialogId))
          }
        })
      })
    }
  }
}
