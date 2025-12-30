import { defineStore } from 'pinia'
import { useDialogsStore } from "@/store/dialog.store";
import { usePrinterStore } from "@/store/printer.store";

export interface OverlayState {
  loading: boolean
  overlay: boolean
  overlayMessage: string
  serverDisconnected: boolean
  errorCaught: string | null
  errorUrl: string | null
  errorResponse: any | null
  isRetrying: boolean
  nextRetryTime: number | null
  isTestingConnection: boolean
}

export const useOverlayStore = defineStore('Overlay', {
  state: (): OverlayState => ({
    loading: true,
    overlay: true,
    overlayMessage: '',
    serverDisconnected: false,
    errorCaught: null,
    errorUrl: null,
    errorResponse: null,
    isRetrying: false,
    nextRetryTime: null,
    isTestingConnection: false
  }),
  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setOverlay(overlay: boolean, message: string = '') {
      this.overlay = overlay
      this.overlayMessage = message
    },
    hideOverlay() {
      this.overlay = false
      this.overlayMessage = ''
      this.loading = false
    },
    setServerDisconnected(disconnected: boolean) {
      this.serverDisconnected = disconnected
      if (disconnected) {
        useDialogsStore().closeAllDialogs()
        usePrinterStore().closeFileExplorer()
        this.overlay = true
        this.loading = false
      } else {
        this.overlay = false
        this.loading = false
      }
    },
    setError(error: string | null, url: string | null = null, response: any | null = null) {
      this.errorCaught = error
      this.errorUrl = url
      this.errorResponse = response
      if (error) {
        this.loading = false
      }
    },
    clearError() {
      this.errorCaught = null
      this.errorUrl = null
      this.errorResponse = null
    },
    startRetry(delayMs: number) {
      this.isRetrying = true
      this.nextRetryTime = Date.now() + delayMs
    },
    incrementRetry(delayMs: number) {
      this.nextRetryTime = Date.now() + delayMs
    },
    resetRetry() {
      this.isRetrying = false
      this.nextRetryTime = null
      this.isTestingConnection = false
    },
    setTestingConnection(isTesting: boolean) {
      this.isTestingConnection = isTesting
    },
    retryNow() {
      this.nextRetryTime = Date.now()
    }
  }
})
