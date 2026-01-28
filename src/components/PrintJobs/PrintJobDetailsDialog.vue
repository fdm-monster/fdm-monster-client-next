<template>
  <v-dialog v-model="isOpen" max-width="900px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center bg-primary text-on-primary">
        <v-icon class="mr-3">info</v-icon>
        <span class="text-h6">Print Job Details</span>
        <v-spacer />
        <v-btn icon variant="text" @click="close" color="on-primary">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-tabs v-model="activeTab" bg-color="primary">
          <v-tab value="overview">
            <v-icon start>dashboard</v-icon>
            Overview
          </v-tab>
          <v-tab value="metadata">
            <v-icon start>description</v-icon>
            Metadata
          </v-tab>
          <v-tab value="statistics">
            <v-icon start>bar_chart</v-icon>
            Statistics
          </v-tab>
          <v-tab value="raw">
            <v-icon start>code</v-icon>
            Raw JSON
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="pa-4">
          <!-- Overview Tab -->
          <v-window-item value="overview">
            <div class="overview-content">
              <!-- Basic Information -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">info</v-icon>
                  Basic Information
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Job ID</div>
                      <div class="text-body-2 font-weight-medium">#{{ job?.id }}</div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Status</div>
                      <v-chip :color="getStatusColor(job?.status)" size="small" class="mt-1">
                        {{ job?.status }}
                      </v-chip>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">File Format</div>
                      <v-chip size="small" class="mt-1" variant="outlined">
                        {{ job?.fileFormat?.toUpperCase() || 'Unknown' }}
                      </v-chip>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-caption text-medium-emphasis">Printer</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ job?.printerName || `Printer #${job?.printerId}` || 'Unknown' }}
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <div class="text-caption text-medium-emphasis">File Name</div>
                      <div class="text-body-2 font-weight-medium">{{ job?.fileName }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Timestamps -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">schedule</v-icon>
                  Timestamps
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Created</div>
                      <div class="text-body-2">{{ formatDate(job?.createdAt) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Updated</div>
                      <div class="text-body-2">{{ formatDate(job?.updatedAt) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Started</div>
                      <div class="text-body-2">{{ formatDate(job?.startedAt) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Ended</div>
                      <div class="text-body-2">{{ formatDate(job?.endedAt) }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Progress & Duration -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">trending_up</v-icon>
                  Progress & Duration
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="6">
                      <div class="text-caption text-medium-emphasis mb-2">Progress</div>
                      <v-progress-linear
                        v-if="job?.progress !== null"
                        :model-value="job?.progress"
                        :color="getProgressColor(job?.progress)"
                        height="25"
                        rounded
                      >
                        <template #default>
                          <span class="text-caption font-weight-bold">
                            {{ Math.round(job?.progress || 0) }}%
                          </span>
                        </template>
                      </v-progress-linear>
                      <div v-else class="text-medium-emphasis">N/A</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Actual Duration</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDuration(job?.statistics?.actualPrintTimeSeconds) }}
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Estimated Duration</div>
                      <div class="text-body-2 font-weight-medium">
                        {{ formatDuration(job?.metadata?.gcodePrintTimeSeconds) }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Filament Usage -->
              <v-card variant="outlined" v-if="hasFilamentData">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">fitness_center</v-icon>
                  Filament Usage
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Used (Grams)</div>
                      <div class="text-h6 text-green">
                        <template v-if="Array.isArray(job?.metadata?.filamentUsedGrams)">
                          <span v-for="(val, idx) in job.metadata.filamentUsedGrams" :key="idx">
                            {{ val != null ? Math.round(val) : '-' }}g<span v-if="idx < job.metadata.filamentUsedGrams.length - 1">, </span>
                          </span>
                        </template>
                        <template v-else>
                          {{ Math.round(job?.metadata?.filamentUsedGrams || 0) }}g
                        </template>
                      </div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Filament Type</div>
                      <div class="text-body-2">
                        <template v-if="Array.isArray(job?.metadata?.filamentType)">
                          <v-chip v-for="(type, idx) in job.metadata.filamentType" :key="idx" size="small" variant="tonal" color="orange" class="mr-1 mb-1">
                            {{ type }}
                          </v-chip>
                        </template>
                        <template v-else>
                          <v-chip size="small" variant="tonal" color="orange">
                            {{ job?.metadata?.filamentType || 'Unknown' }}
                          </v-chip>
                        </template>
                      </div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Nozzle Ø</div>
                      <div class="text-body-2">
                        <template v-if="Array.isArray(job?.metadata?.nozzleDiameterMm)">
                          <v-chip v-for="(diam, idx) in job.metadata.nozzleDiameterMm" :key="idx" size="small" variant="tonal" color="blue-grey" class="mr-1 mb-1">
                            {{ diam }}mm
                          </v-chip>
                        </template>
                        <template v-else>
                          <v-chip size="small" variant="tonal" color="blue-grey">
                            {{ job?.metadata?.nozzleDiameterMm || 'N/A' }}mm
                          </v-chip>
                        </template>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Status Reason -->
              <v-alert v-if="job?.statusReason" type="warning" class="mt-4">
                <strong>Status Reason:</strong> {{ job.statusReason }}
              </v-alert>
            </div>
          </v-window-item>

          <!-- Metadata Tab -->
          <v-window-item value="metadata">
            <div v-if="job?.metadata" class="metadata-content">
              <!-- 3MF Multi-Plate Specific -->
              <v-card v-if="is3MFMultiPlate" variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 bg-info">
                  <v-icon start size="small">layers</v-icon>
                  3MF Multi-Plate Information
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="4">
                      <div class="text-caption text-medium-emphasis">Total Plates</div>
                      <div class="text-h6">{{ (job.metadata as any).totalPlates }}</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-caption text-medium-emphasis">Current Plate</div>
                      <div class="text-h6">{{ (job.metadata as any).plateNumber }}</div>
                    </v-col>
                    <v-col cols="4">
                      <div class="text-caption text-medium-emphasis">Source File</div>
                      <div class="text-body-2">{{ (job.metadata as any).sourceFile }}</div>
                    </v-col>
                  </v-row>

                  <!-- Plates Details -->
                  <v-expansion-panels v-if="(job.metadata as any).plates" class="mt-4">
                    <v-expansion-panel
                      v-for="(plate, index) in (job.metadata as any).plates"
                      :key="index"
                    >
                      <v-expansion-panel-title>
                        <div>
                          <v-icon start size="small">view_in_ar</v-icon>
                          Plate {{ plate.plateNumber }}
                          <v-chip size="x-small" class="ml-2" color="primary">
                            {{ plate.objects?.length || 0 }} objects
                          </v-chip>
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row dense>
                          <v-col cols="4">
                            <div class="text-caption text-medium-emphasis">Print Time</div>
                            <div class="text-body-2">{{ formatDuration(plate.gcodePrintTimeSeconds) }}</div>
                          </v-col>
                          <v-col cols="4">
                            <div class="text-caption text-medium-emphasis">Filament</div>
                            <div class="text-body-2">
                              <template v-if="Array.isArray(plate.filamentUsedGrams)">
                                <span v-for="(val, idx) in plate.filamentUsedGrams" :key="idx">
                                  {{ val != null ? Math.round(val) : '-' }}g<span v-if="Number(idx) < plate.filamentUsedGrams.length - 1">, </span>
                                </span>
                              </template>
                              <template v-else>
                                {{ Math.round(plate.filamentUsedGrams || 0) }}g
                              </template>
                            </div>
                          </v-col>
                          <v-col cols="4">
                            <div class="text-caption text-medium-emphasis">Layers</div>
                            <div class="text-body-2">{{ plate.totalLayers || 'N/A' }}</div>
                          </v-col>
                        </v-row>
                        <v-divider class="my-2" />
                        <div class="text-caption text-medium-emphasis mb-1">Objects:</div>
                        <v-chip
                          v-for="(obj, objIdx) in plate.objects"
                          :key="objIdx"
                          size="small"
                          class="mr-1 mb-1"
                        >
                          {{ obj.name }}
                        </v-chip>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-card-text>
              </v-card>

              <!-- File Information -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">insert_drive_file</v-icon>
                  File Information
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12" md="8">
                      <div class="text-caption text-medium-emphasis">File Name</div>
                      <div class="text-body-2 font-weight-medium">{{ job.metadata.fileName }}</div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">File Size</div>
                      <div class="text-body-2">{{ formatFileSize(job.metadata.fileSize) }}</div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Format</div>
                      <div class="text-body-2">{{ job.metadata.fileFormat?.toUpperCase() }}</div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Slicer</div>
                      <div class="text-body-2">{{ job.metadata.slicerVersion || 'Unknown' }}</div>
                    </v-col>
                    <v-col cols="6" md="4">
                      <div class="text-caption text-medium-emphasis">Printer Model</div>
                      <div class="text-body-2">{{ job.metadata.printerModel || 'Unknown' }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Print Settings -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">settings</v-icon>
                  Print Settings
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Layer Height</div>
                      <div class="text-body-2">{{ job.metadata.layerHeight || 'N/A' }}mm</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">First Layer Height</div>
                      <div class="text-body-2">{{ job.metadata.firstLayerHeight || 'N/A' }}mm</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Bed Temp</div>
                      <div class="text-body-2">{{ job.metadata.bedTemperature || 'N/A' }}°C</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Nozzle Temp</div>
                      <div class="text-body-2">{{ job.metadata.nozzleTemperature || 'N/A' }}°C</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Fill Density</div>
                      <div class="text-body-2">{{ job.metadata.fillDensity || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Total Layers</div>
                      <div class="text-body-2">{{ job.metadata.totalLayers || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Max Layer Z</div>
                      <div class="text-body-2">{{ job.metadata.maxLayerZ || 'N/A' }}mm</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Nozzle Diameter</div>
                      <div class="text-body-2">
                        <template v-if="Array.isArray(job.metadata.nozzleDiameterMm)">
                          <v-chip v-for="(diam, idx) in job.metadata.nozzleDiameterMm" :key="idx" size="small" variant="tonal" color="blue-grey" class="mr-1 mb-1">
                            {{ diam }}mm
                          </v-chip>
                        </template>
                        <template v-else>
                          <v-chip size="small" variant="tonal" color="blue-grey">
                            {{ job.metadata.nozzleDiameterMm || 'N/A' }}mm
                          </v-chip>
                        </template>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <!-- Filament Details -->
              <v-card variant="outlined">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">fiber_manual_record</v-icon>
                  Filament Details
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Filament Diameter</div>
                      <div class="text-body-2">{{ job.metadata.filamentDiameterMm || 'N/A' }}mm</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Filament Density</div>
                      <div class="text-body-2">{{ job.metadata.filamentDensityGramsCm3 || 'N/A' }}g/cm³</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Filament Type</div>
                      <div class="text-body-2">
                        <template v-if="Array.isArray(job.metadata.filamentType)">
                          <v-chip v-for="(type, idx) in job.metadata.filamentType" :key="idx" size="small" variant="tonal" color="orange" class="mr-1 mb-1">
                            {{ type }}
                          </v-chip>
                        </template>
                        <template v-else>
                          <v-chip size="small" variant="tonal" color="orange">
                            {{ job.metadata.filamentType || 'Unknown' }}
                          </v-chip>
                        </template>
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Total Used</div>
                      <div class="text-body-2">{{ job.metadata.totalFilamentUsedGrams || 'N/A' }}g</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </div>
            <v-alert v-else type="info">No metadata available for this job.</v-alert>
          </v-window-item>

          <!-- Statistics Tab -->
          <v-window-item value="statistics">
            <div v-if="job?.statistics" class="statistics-content">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">timer</v-icon>
                  Time Statistics
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Started At</div>
                      <div class="text-body-2">{{ formatDate(job.statistics.startedAt) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Ended At</div>
                      <div class="text-body-2">{{ formatDate(job.statistics.endedAt) }}</div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Actual Print Time</div>
                      <div class="text-body-2 font-weight-bold">
                        {{ formatDuration(job.statistics.actualPrintTimeSeconds) }}
                      </div>
                    </v-col>
                    <v-col cols="6" md="3">
                      <div class="text-caption text-medium-emphasis">Progress</div>
                      <div class="text-body-2">{{ job.statistics.progress || 0 }}%</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">layers</v-icon>
                  Layer Information
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">Current Layer</div>
                      <div class="text-h6">{{ job.statistics.currentLayer || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-caption text-medium-emphasis">Total Layers</div>
                      <div class="text-h6">{{ job.statistics.totalLayers || 'N/A' }}</div>
                    </v-col>
                    <v-col cols="12" v-if="job.statistics.currentLayer && job.statistics.totalLayers">
                      <v-progress-linear
                        :model-value="(job.statistics.currentLayer / job.statistics.totalLayers) * 100"
                        color="primary"
                        height="20"
                        rounded
                      >
                        <template #default>
                          <span class="text-caption font-weight-bold">
                            {{ job.statistics.currentLayer }} / {{ job.statistics.totalLayers }}
                          </span>
                        </template>
                      </v-progress-linear>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card variant="outlined" v-if="job.statistics.toolChanges">
                <v-card-title class="text-subtitle-1 section-header">
                  <v-icon start size="small">build</v-icon>
                  Multi-Tool Information
                </v-card-title>
                <v-card-text>
                  <v-row dense>
                    <v-col cols="12">
                      <div class="text-caption text-medium-emphasis">Tool Changes</div>
                      <div class="text-h6">{{ job.statistics.toolChanges }}</div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-alert v-if="job.statistics.failureReason" type="error" class="mt-4">
                <div class="text-subtitle-2 mb-1">Failure Reason</div>
                <div>{{ job.statistics.failureReason }}</div>
                <div v-if="job.statistics.failureTime" class="text-caption mt-2">
                  Failed at: {{ formatDate(job.statistics.failureTime) }}
                </div>
              </v-alert>
            </div>
            <v-alert v-else type="info">No statistics available for this job.</v-alert>
          </v-window-item>

          <!-- Raw JSON Tab -->
          <v-window-item value="raw">
            <v-card variant="outlined">
              <v-card-text>
                <div class="d-flex justify-end mb-2">
                  <v-btn size="small" @click="copyToClipboard" prepend-icon="content_copy">
                    Copy JSON
                  </v-btn>
                </div>
                <pre class="json-viewer">{{ formattedJson }}</pre>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-btn
          v-if="canReAnalyze"
          color="info"
          variant="elevated"
          prepend-icon="refresh"
          :loading="reAnalyzing"
          @click="handleReAnalyze"
        >
          Re-Analyze Job
          <v-tooltip activator="parent" location="top">
            Trigger re-analysis of this print job to extract updated metadata from the file
          </v-tooltip>
        </v-btn>

        <v-btn
          v-if="canDelete"
          color="error"
          variant="outlined"
          prepend-icon="delete"
          :loading="deleting"
          @click="handleDeleteClick"
        >
          Delete Job
          <v-tooltip activator="parent" location="top">
            Permanently delete this print job
          </v-tooltip>
        </v-btn>

        <v-spacer />
        <v-btn color="primary" variant="elevated" @click="close">Close</v-btn>
      </v-card-actions>
    </v-card>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center bg-error text-on-error">
          <v-icon class="mr-3">warning</v-icon>
          <span>Delete Print Job?</span>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-2">
            Are you sure you want to delete this print job?
          </p>
          <v-alert type="info" density="compact" class="mb-2">
            <strong>Job:</strong> {{ job?.fileName }}
          </v-alert>
          <p class="text-body-2 text-medium-emphasis">
            This action cannot be undone. All job data and metadata will be permanently removed.
          </p>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="handleDeleteCancel"
            :disabled="deleting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="handleDeleteConfirm"
            :loading="deleting"
          >
            Delete Job
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import type { PrintJobDto } from '@/backend/print-job.service'
import { PrintJobService } from '@/backend/print-job.service'
import { useSnackbar } from '@/shared/snackbar.composable'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { formatFileSize } from "@/utils/file-size.util";
import { formatDate, formatDuration } from "@/utils/date-time.utils";

const jobDetailsDialog = useDialog(DialogName.PrintJobDetailsDialog)
const { info, error } = useSnackbar()

const isOpen = computed(() => jobDetailsDialog.isDialogOpened())
const context = computed(() => jobDetailsDialog.context())

const job = ref<PrintJobDto | null>(null)
const loading = ref(false)
const activeTab = ref('overview')
const reAnalyzing = ref(false)
const deleting = ref(false)
const showDeleteConfirm = ref(false)

// Load job when dialog opens with a jobId in context
watch(() => context.value?.jobId, async (jobId) => {
  if (jobId && isOpen.value) {
    loading.value = true
    try {
      job.value = await PrintJobService.getJob(jobId)
    } catch (err: any) {
      error(
        'Failed to Load Job',
        err?.response?.data?.message || err?.message || 'Could not load job details'
      )
      jobDetailsDialog.closeDialog()
    } finally {
      loading.value = false
    }
  }
}, { immediate: true })

watch(isOpen, (value) => {
  if (value) {
    activeTab.value = 'overview'
  } else {
    // Clear job when dialog closes
    job.value = null
  }
})

const is3MFMultiPlate = computed(() => {
  return job.value?.metadata?.fileFormat === '3mf' &&
         (job.value.metadata as any).isMultiPlate === true
})

const hasFilamentData = computed(() => {
  return job.value?.metadata?.filamentUsedGrams ||
         job.value?.metadata?.filamentUsedMm
})

const formattedJson = computed(() => {
  return JSON.stringify(job.value, null, 2)
})

const canReAnalyze = computed(() => {
  // Allow re-analysis for jobs that are not currently printing or starting
  const status = job.value?.status
  return status !== 'PRINTING' && status !== 'STARTING'
})

const canDelete = computed(() => {
  // Allow deletion for jobs that are not currently printing
  const status = job.value?.status
  return status !== 'PRINTING' && status !== 'STARTING'
})

const close = () => {
  jobDetailsDialog.closeDialog()
}

const handleReAnalyze = async () => {
  if (!job.value?.id) return

  reAnalyzing.value = true
  try {
    job.value = await PrintJobService.reAnalyzeJob(job.value.id)

    info(
      'Job Re-Analysis Started',
      `Re-analysis triggered for "${job.value.fileName}". The job will be analyzed in the background.`,
      5000
    )
  } catch (err: any) {
    console.error('Failed to re-analyze job:', err)
    error(
      'Re-Analysis Failed',
      err?.response?.data?.message || err?.message || 'Failed to trigger job re-analysis. Please try again.'
    )
  } finally {
    reAnalyzing.value = false
  }
}

const handleDeleteClick = () => {
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (!job.value?.id) return

  deleting.value = true
  try {
    await PrintJobService.deleteJob(job.value.id)

    info(
      'Job Deleted',
      `Successfully deleted job "${job.value.fileName}".`,
      3000
    )

    showDeleteConfirm.value = false
    close()
  } catch (err: any) {
    console.error('Failed to delete job:', err)
    error(
      'Delete Failed',
      err?.response?.data?.message || err?.message || 'Failed to delete job. Please try again.'
    )
  } finally {
    deleting.value = false
  }
}

const handleDeleteCancel = () => {
  showDeleteConfirm.value = false
}

const getStatusColor = (status: string | null | undefined): string => {
  if (!status) return 'grey'
  switch (status) {
    case 'COMPLETED': return 'success'
    case 'FAILED': return 'error'
    case 'CANCELLED': return 'warning'
    case 'PRINTING':
    case 'STARTING': return 'primary'
    case 'PAUSED': return 'orange'
    case 'QUEUED': return 'info'
    case 'PENDING': return 'grey-darken-1'
    case 'UNKNOWN': return 'grey'
    default: return 'grey'
  }
}

const getProgressColor = (progress: number | null | undefined): string => {
  if (!progress) return 'grey'
  if (progress >= 90) return 'success'
  if (progress >= 50) return 'primary'
  if (progress >= 25) return 'warning'
  return 'error'
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(formattedJson.value)
    // Could add a toast notification here
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<style scoped>
.overview-content,
.metadata-content,
.statistics-content {
  max-height: 600px;
  overflow-y: auto;
}

.json-viewer {
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  max-height: 600px;
  overflow-y: auto;
  color: rgb(var(--v-theme-on-surface));
}

.v-window-item {
  min-height: 400px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 12px;
}

/* Ensure tab text is visible in dark mode */
:deep(.v-tab) {
  color: rgb(var(--v-theme-on-primary)) !important;
}

:deep(.v-tab--selected) {
  color: rgb(var(--v-theme-on-primary)) !important;
  opacity: 1;
}

/* Section headers with darker background for better dark mode visibility */
:deep(.v-card-title.section-header) {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.3);
}

/* Remove white borders on outlined cards in dark mode */
:deep(.v-card--variant-outlined) {
  border-color: rgba(var(--v-theme-on-surface), 0.12) !important;
}
</style>

