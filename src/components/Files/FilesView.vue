<template>
  <v-container fluid>
    <!-- Drag and Drop Upload Area -->
    <v-card
      class="mb-6 upload-drop-zone"
      elevation="2"
      :class="{ 'drag-over': isDragging }"
      @dragenter.prevent="handleUploadDragEnter"
      @dragover.prevent="handleUploadDragOver"
      @dragleave.prevent="handleUploadDragLeave"
      @drop.prevent="handleUploadDrop"
    >
      <v-card-text class="text-center pa-6">
        <v-icon
          size="64"
          color="primary"
          class="mb-4"
          >cloud_upload</v-icon
        >
        <h3 class="text-h6 mb-2">Upload Files</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Drag and drop files here or click to browse
        </p>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept=".gcode,.3mf,.bgcode"
          style="display: none"
          @change="handleFileSelect"
        />
        <v-btn
          color="primary"
          variant="elevated"
          @click="fileInput?.click()"
          :loading="uploading"
        >
          <v-icon start>folder_open</v-icon>
          Select Files
        </v-btn>
        <div
          v-if="uploadProgress.length > 0"
          class="mt-4"
        >
          <v-progress-linear
            v-for="(progress, index) in uploadProgress"
            :key="index"
            :model-value="progress.percent"
            :color="progress.error ? 'error' : 'primary'"
            height="25"
            class="mb-2"
          >
            <template #default>
              <div class="text-caption">
                {{ progress.fileName }} -
                {{ progress.error || `${progress.percent}%` }}
              </div>
            </template>
          </v-progress-linear>
        </div>
      </v-card-text>
    </v-card>

    <!-- Files Grid -->
    <v-card elevation="2">
      <v-card-title class="d-flex align-center pb-0">
        <v-icon
          class="mr-3"
          color="primary"
          >inventory_2</v-icon
        >
        <span class="text-h6">File Storage</span>
        <v-spacer />
        <v-chip
          v-if="totalCount > 0"
          variant="tonal"
          size="small"
          class="mr-3"
        >
          {{ totalCount }} files
        </v-chip>
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="search"
          label="Search files"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          class="mr-4"
          style="max-width: 300px"
        />
        <v-btn
          color="primary"
          @click="loadFiles"
          :loading="loading"
          variant="elevated"
        >
          <v-icon left>refresh</v-icon>
          Refresh
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- edited by claude on 2026.01.24.19.32 -->
        <!-- Tree Toolbar -->
        <div class="d-flex justify-space-between mb-3">
          <v-btn
            size="small"
            variant="elevated"
            color="primary"
            disabled
          >
            <v-icon left>create_new_folder</v-icon>
            New Folder
            <v-tooltip activator="parent" location="bottom">
              Creating folders requires backend support for paths without files
            </v-tooltip>
          </v-btn>
          <div class="d-flex gap-2">
            <v-btn
              size="small"
              variant="text"
              @click="expandAll"
          >
            <v-icon start>unfold_more</v-icon>
            Expand All
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            @click="collapseAll"
          >
            <v-icon start>unfold_less</v-icon>
            Collapse All
          </v-btn>
          </div>
        </div>
        <!-- End of Claude's edit -->

        <!-- Loading State -->
        <div
          v-if="loading"
          class="d-flex justify-center py-8"
        >
          <v-progress-circular
            indeterminate
            size="48"
            color="primary"
          />
        </div>

        <!-- Tree Table -->
        <div v-else class="tree-table-container">
          <!-- Table Header -->
          <div class="tree-table-header">
            <div class="tree-cell cell-thumbnail">Thumb</div>
            <div class="tree-cell cell-name">Name</div>
            <div class="tree-cell cell-type">Type</div>
            <div class="tree-cell cell-material">Material</div>
            <div class="tree-cell cell-temps">Temps</div>
            <div class="tree-cell cell-plates">Plates</div>
            <div class="tree-cell cell-time">Print Time</div>
            <div class="tree-cell cell-filament">Filament</div>
            <div class="tree-cell cell-actions">Actions</div>
          </div>

          <!-- Table Body -->
          <div class="tree-table-body">
            <!-- No files state -->
            <div
              v-if="flattenedTree.length === 0"
              class="text-center py-8"
            >
              <v-icon
                size="64"
                color="medium-emphasis"
                class="mb-2"
              >
                folder_open
              </v-icon>
              <div class="text-body-1 text-medium-emphasis">
                No files found
              </div>
            </div>

            <!-- Tree Rows -->
            <!-- edited by claude on 2026.01.24.19.45 -->
            <div
              v-for="node in flattenedTree"
              :key="node.id"
              class="tree-table-row"
              :class="{
                'is-folder': node.type === 'folder',
                'drag-over': dragOverNodeId === node.id,
                'dragging': draggingNodeId === node.id
              }"
              draggable="true"
              @dragstart="handleDragStart(node, $event)"
              @dragend="handleDragEnd"
              @dragover.prevent="handleDragOver(node, $event)"
              @dragleave="handleDragLeave(node)"
              @drop.prevent="handleDrop(node, $event)"
            >
            <!-- End of Claude's edit -->
              <!-- Thumbnail Column -->
              <div class="tree-cell cell-thumbnail">
                <!-- edited by claude on 2026.01.24.15.10 -->
                <v-avatar
                  v-if="node.type === 'file' && node.file"
                  size="40"
                  rounded
                >
                  <v-img
                    v-if="node.file.thumbnails?.length > 0"
                    :src="getThumbnailUrl(node.file.fileStorageId)"
                    cover
                  >
                    <template #error>
                      <v-icon size="small">description</v-icon>
                    </template>
                  </v-img>
                  <v-icon
                    v-else
                    color="primary"
                    size="small"
                    >description</v-icon
                  >
                </v-avatar>
                <span v-else class="text-medium-emphasis">-</span>
                <!-- End of Claude's edit -->
              </div>

              <!-- Name Column -->
              <div class="tree-cell cell-name" :style="{ paddingLeft: `${node.depth * 24}px` }">
                <!-- edited by claude on 2026.01.24.14.50 -->
                <div class="d-flex align-center">
                  <v-btn
                    v-if="node.type === 'folder'"
                    icon
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="toggleExpansion(node.id)"
                  >
                    <v-icon size="small">
                      {{ node.expanded ? 'expand_more' : 'chevron_right' }}
                    </v-icon>
                  </v-btn>
                  <!-- edited by claude on 2026.01.24.18.35 - only show icon for folders -->
                  <v-icon v-if="node.type === 'folder'" class="mr-2" color="primary">
                    folder
                  </v-icon>
                  <!-- End of Claude's edit -->
                  <!-- edited by claude on 2026.01.24.21.20 - add left padding to align files with folder names -->
                  <div v-if="node.type === 'file' && node.file" style="margin-left: 48px;">
                    <div class="text-body-2 font-weight-medium">
                      {{ node.file.metadata?._originalFileName || node.file.fileName }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ node.file.fileFormat.toUpperCase() }} • {{ formatFileSize(node.file.fileSize) }}
                    </div>
                  </div>
                  <!-- End of Claude's edit -->
                  <span v-else class="text-body-2">{{ node.name }}</span>
                </div>
                <!-- End of Claude's edit -->
              </div>

              <!-- Type Column -->
              <div class="tree-cell cell-type">
                <v-avatar
                  v-if="node.type === 'file' && node.file && getPrinterTypeLogo(node.file.metadata || {}, node.file.fileFormat)"
                  size="32"
                  rounded="0"
                >
                  <v-img :src="getPrinterTypeLogo(node.file.metadata || {}, node.file.fileFormat)" contain />
                </v-avatar>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Material Column -->
              <div class="tree-cell cell-material">
                <v-chip
                  v-if="node.type === 'file' && node.file?.metadata?.filamentType"
                  size="small"
                  variant="tonal"
                  color="orange"
                >
                  {{ node.file.metadata.filamentType }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Temperatures Column -->
              <div class="tree-cell cell-temps">
                <div v-if="node.type === 'file' && node.file && (node.file.metadata?.nozzleTemperature || node.file.metadata?.bedTemperature)" class="text-caption">
                  <div v-if="node.file.metadata.nozzleTemperature">
                    🔥 {{ node.file.metadata.nozzleTemperature }}°C
                  </div>
                  <div v-if="node.file.metadata.bedTemperature">
                    🛏️ {{ node.file.metadata.bedTemperature }}°C
                  </div>
                </div>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Plates Column -->
              <div class="tree-cell cell-plates">
                <v-chip
                  v-if="node.type === 'file' && node.file"
                  size="small"
                  variant="tonal"
                  color="blue"
                >
                  <v-icon start size="small">layers</v-icon>
                  {{ node.file.metadata?.totalPlates ?? 1 }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Print Time Column -->
              <div class="tree-cell cell-time">
                <v-chip
                  v-if="node.type === 'file' && node.file?.metadata?.gcodePrintTimeSeconds"
                  color="info"
                  size="small"
                  variant="tonal"
                >
                  <v-icon start size="small">schedule</v-icon>
                  {{ formatDuration(node.file.metadata.gcodePrintTimeSeconds) }}
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Filament Column -->
              <div class="tree-cell cell-filament">
                <v-chip
                  v-if="node.type === 'file' && node.file?.metadata?.filamentUsedGrams"
                  color="green"
                  size="small"
                  variant="tonal"
                >
                  <v-icon start size="small">fitness_center</v-icon>
                  {{ node.file.metadata.filamentUsedGrams.toFixed(1) }}g
                </v-chip>
                <span v-else class="text-medium-emphasis">-</span>
              </div>

              <!-- Actions Column -->
              <div class="tree-cell cell-actions">
                <!-- edited by claude on 2026.01.24.16.25 -->
                <div v-if="node.type === 'file' && node.file" class="d-flex ga-1">
                  <!-- File Management Menu -->
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="folder_open"
                        size="small"
                        variant="text"
                        color="primary"
                        v-bind="props"
                      >
                        <v-icon>folder_open</v-icon>
                        <v-tooltip activator="parent" location="top">
                          File management
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="openRenameDialog(node.file)">
                        <template v-slot:prepend>
                          <v-icon>edit</v-icon>
                        </template>
                        <v-list-item-title>Rename</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openMoveDialog(node.file)">
                        <template v-slot:prepend>
                          <v-icon>drive_file_move</v-icon>
                        </template>
                        <v-list-item-title>Move</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn
                    icon="add_to_queue"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openQueueDialog(node.file)"
                  >
                    <v-icon>add_to_queue</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Add to queue
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="analytics"
                    size="small"
                    variant="text"
                    color="info"
                    @click="analyzeFile(node.file)"
                    :loading="analyzingFiles.has(node.file.fileStorageId)"
                  >
                    <v-icon>analytics</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Trigger analysis
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="visibility"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="viewFile(node.file)"
                  >
                    <v-icon>visibility</v-icon>
                    <v-tooltip activator="parent" location="top">
                      View details
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon="delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="deleteFile(node.file)"
                  >
                    <v-icon>delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Delete file
                    </v-tooltip>
                  </v-btn>
                </div>
                <!-- edited by claude on 2026.01.24.19.30 -->
                <!-- Folder Actions -->
                <div v-else-if="node.type === 'folder'" class="d-flex ga-1">
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon="more_vert"
                        size="small"
                        variant="text"
                        color="primary"
                        v-bind="props"
                      >
                        <v-icon>more_vert</v-icon>
                        <v-tooltip activator="parent" location="top">
                          Folder actions
                        </v-tooltip>
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item @click="openFolderRenameDialog(node)">
                        <template v-slot:prepend>
                          <v-icon>edit</v-icon>
                        </template>
                        <v-list-item-title>Rename Folder</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openFolderMoveDialog(node)">
                        <template v-slot:prepend>
                          <v-icon>drive_file_move</v-icon>
                        </template>
                        <v-list-item-title>Move Folder</v-list-item-title>
                      </v-list-item>
                      <v-list-item disabled>
                        <template v-slot:prepend>
                          <v-icon>create_new_folder</v-icon>
                        </template>
                        <v-list-item-title>New Subfolder</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">Requires backend update</v-list-item-subtitle>
                      </v-list-item>
                      <v-divider class="my-1" />
                      <v-list-item @click="confirmDeleteFolder(node)" class="text-error">
                        <template v-slot:prepend>
                          <v-icon color="error">delete</v-icon>
                        </template>
                        <v-list-item-title>Delete Folder</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
                <div v-else class="text-medium-emphasis">-</div>
                <!-- End of Claude's edit -->
              </div>
            </div>
          </div>
        </div>
        <!-- End of Claude's edit -->
        <v-data-table
          v-if="false"
          :headers="headers"
          :items="filteredFiles"
          :loading="loading"
          class="files-table"
          loading-text="Loading files..."
          no-data-text="No files found"
          :items-per-page="25"
        >
          <template #item.thumbnail="{ item }">
            <FileThumbnailCell :file-storage-id="item.fileStorageId" :thumbnails="item.thumbnails || []"/>
          </template>

          <!-- File Name Column -->
          <template #item.fileName="{ item }">
            <div class="d-flex align-center">
              <v-avatar
                size="40"
                class="mr-3"
                rounded
              >
                <v-img
                  v-if="item.thumbnails?.length > 0"
                  :src="getThumbnailUrl(item.fileStorageId)"
                  cover
                >
                  <template #error>
                    <v-icon>description</v-icon>
                  </template>
                </v-img>
                <v-icon
                  v-else
                  color="primary"
                  >description</v-icon
                >
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-medium">
                  {{ item.metadata?._originalFileName || item.fileName }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.fileFormat.toUpperCase() }} •
                  {{ formatFileSize(item.fileSize) }}
                </div>
              </div>
            </div>
          </template>

          <!-- Printer Type Column -->
          <template #item.printerType="{ item }">
            <v-avatar
              size="32"
              v-if="getPrinterTypeLogo(item.metadata || {}, item.fileFormat)"
              rounded="0"
            >
              <v-img
                :src="getPrinterTypeLogo(item.metadata || {}, item.fileFormat)"
                contain
              />
            </v-avatar>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Material Column -->
          <template #item.material="{ item }">
            <v-chip
              v-if="item.metadata?.filamentType"
              size="small"
              variant="tonal"
              color="orange"
            >
              {{ item.metadata.filamentType }}
            </v-chip>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Temperatures Column -->
          <template #item.temperatures="{ item }">
            <div
              v-if="
                item.metadata?.nozzleTemperature ||
                item.metadata?.bedTemperature
              "
              class="text-caption"
            >
              <div v-if="item.metadata.nozzleTemperature">
                🔥 {{ item.metadata.nozzleTemperature }}°C
              </div>
              <div v-if="item.metadata.bedTemperature">
                🛏️ {{ item.metadata.bedTemperature }}°C
              </div>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Plates Column -->
          <template #item.plates="{ item }">
            <v-chip
              size="small"
              variant="tonal"
              color="blue"
            >
              <v-icon
                start
                size="small"
                >layers</v-icon
              >
              {{ item.metadata?.totalPlates ?? 1 }}
            </v-chip>
          </template>

          <!-- Printer Model Column -->
          <template #item.printerModel="{ item }">
            <div
              v-if="item.metadata?.printerModel"
              class="text-caption"
            >
              {{ item.metadata.printerModel }}
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Print Time Column -->
          <template #item.printTime="{ item }">
            <div
              v-if="item.metadata?.gcodePrintTimeSeconds"
              class="text-body-2"
            >
              <v-chip
                color="info"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  size="small"
                  >schedule</v-icon
                >
                {{ formatDuration(item.metadata.gcodePrintTimeSeconds) }}
              </v-chip>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Filament Column -->
          <template #item.filament="{ item }">
            <div
              v-if="item.metadata?.filamentUsedGrams"
              class="text-body-2"
            >
              <v-chip
                color="green"
                size="small"
                variant="tonal"
              >
                <v-icon
                  start
                  size="small"
                  >fitness_center</v-icon
                >
                {{ item.metadata.filamentUsedGrams.toFixed(1) }}g
              </v-chip>
            </div>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Thumbnails Column -->
          <template #item.thumbnails="{ item }">
            <v-chip
              v-if="item.thumbnails?.length > 0"
              size="small"
              color="success"
              variant="tonal"
            >
              <v-icon
                start
                size="small"
                >image</v-icon
              >
              {{ item.thumbnails.length }}
            </v-chip>
            <span
              v-else
              class="text-medium-emphasis"
              >-</span
            >
          </template>

          <!-- Created Date Column -->
          <template #item.createdAt="{ item }">
            <div class="text-body-2">
              <div>{{ formatDate(item.createdAt) }}</div>
              <div class="text-caption text-medium-emphasis">
                {{ formatRelativeTime(item.createdAt) }}
              </div>
            </div>
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              icon="add_to_queue"
              size="small"
              variant="text"
              color="primary"
              @click="openQueueDialog(item)"
            >
              <v-icon>add_to_queue</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Add to queue
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="analytics"
              size="small"
              variant="text"
              color="info"
              @click="analyzeFile(item)"
              :loading="analyzingFiles.has(item.fileStorageId)"
            >
              <v-icon>analytics</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Trigger analysis
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="visibility"
              size="small"
              variant="text"
              color="primary"
              @click="viewFile(item)"
            >
              <v-icon>visibility</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                View details
              </v-tooltip>
            </v-btn>
            <v-btn
              icon="delete"
              size="small"
              variant="text"
              color="error"
              @click="deleteFile(item)"
            >
              <v-icon>delete</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
              >
                Delete file
              </v-tooltip>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- File Details Dialog -->
    <v-dialog
      v-model="detailsDialog"
      max-width="800"
    >
      <v-card v-if="selectedFile">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">description</v-icon>
          File Details
          <v-spacer />
          <v-btn
            icon="close"
            variant="text"
            @click="detailsDialog = false"
          />
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <h3 class="text-h6 mb-3">File Information</h3>
              <div class="mb-2">
                <strong>Name:</strong>
                {{
                  selectedFile.metadata?._originalFileName ||
                  selectedFile.fileName
                }}
              </div>
              <div class="mb-2">
                <strong>Format:</strong>
                {{ selectedFile.fileFormat.toUpperCase() }}
              </div>
              <div class="mb-2">
                <strong>Size:</strong>
                {{ formatFileSize(selectedFile.fileSize) }}
              </div>
              <div class="mb-2">
                <strong>Hash:</strong> <code>{{ selectedFile.fileHash }}</code>
              </div>
              <div class="mb-2">
                <strong>Storage ID:</strong>
                <code>{{ selectedFile.fileStorageId }}</code>
              </div>
              <div class="mb-2">
                <strong>Created:</strong>
                {{ formatDate(selectedFile.createdAt) }}
              </div>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <h3 class="text-h6 mb-3">Print Metadata</h3>
              <div v-if="selectedFile.metadata">
                <div
                  v-if="selectedFile.metadata.gcodePrintTimeSeconds"
                  class="mb-2"
                >
                  <strong>Print Time:</strong>
                  {{
                    formatDuration(selectedFile.metadata.gcodePrintTimeSeconds)
                  }}
                </div>
                <div
                  v-if="selectedFile.metadata.filamentUsedGrams"
                  class="mb-2"
                >
                  <strong>Filament:</strong>
                  {{ selectedFile.metadata.filamentUsedGrams.toFixed(1) }}g
                </div>
                <div
                  v-if="selectedFile.metadata.nozzleDiameterMm"
                  class="mb-2"
                >
                  <strong>Nozzle Diameter:</strong>
                  {{ selectedFile.metadata.nozzleDiameterMm }}mm
                </div>
                <div
                  v-if="selectedFile.metadata.layerHeight"
                  class="mb-2"
                >
                  <strong>Layer Height:</strong>
                  {{ selectedFile.metadata.layerHeight }}mm
                </div>
                <div
                  v-if="selectedFile.metadata.totalLayers"
                  class="mb-2"
                >
                  <strong>Total Layers:</strong>
                  {{ selectedFile.metadata.totalLayers }}
                </div>
              </div>
              <div
                v-else
                class="text-medium-emphasis"
              >
                No metadata available
              </div>
            </v-col>

            <v-col
              v-if="selectedFile.thumbnails?.length > 0"
              cols="12"
            >
              <h3 class="text-h6 mb-3">
                Thumbnails ({{ selectedFile.thumbnails.length }})
              </h3>
              <div class="d-flex flex-wrap ga-2">
                <v-img
                  v-for="(thumb, i) in selectedFile.thumbnails"
                  :key="i"
                  :src="getThumbnailUrl(selectedFile.fileStorageId, thumb.index)"
                  width="150"
                  height="150"
                  cover
                  class="rounded"
                />
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            variant="text"
            @click="detailsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Queue to Printers Dialog -->
    <v-dialog
      v-model="queueDialog"
      max-width="600"
    >
      <v-card v-if="selectedFileForQueue">
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">add_to_queue</v-icon>
          Queue File to Printers
          <v-spacer />
          <v-btn
            icon="close"
            variant="text"
            @click="queueDialog = false"
          />
        </v-card-title>

        <v-card-text>
          <div class="mb-4">
            <strong>File:</strong>
            {{
              selectedFileForQueue.metadata?._originalFileName ||
              selectedFileForQueue.fileName
            }}
          </div>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Select one or more printers to queue this file to
          </v-alert>

          <v-list>
            <v-list-item
              v-for="printer in availablePrinters"
              :key="printer.id"
              @click="togglePrinterSelection(printer.id)"
            >
              <template #prepend>
                <v-checkbox
                  :model-value="selectedPrinters.includes(printer.id)"
                  @click.stop="togglePrinterSelection(printer.id)"
                />
              </template>
              <v-list-item-title>
                {{ printer.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ getPrinterTypeName(printer.printerType) }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-alert
            v-if="availablePrinters.length === 0"
            type="warning"
            variant="tonal"
          >
            No printers available
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="queueDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="selectedPrinters.length === 0"
            @click="queueToSelectedPrinters"
            :loading="queuing"
          >
            Queue to {{ selectedPrinters.length }} Printer(s)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- edited by claude on 2026.01.24.15.45 -->
    <!-- Rename File Dialog -->
    <FileRenameDialog
      v-model="renameDialog"
      :current-file-path="selectedFileForRename?.fileName || ''"
      :current-file-name="selectedFileForRename?.metadata?._originalFileName || selectedFileForRename?.fileName || ''"
      @rename="handleFileRename"
    />

    <!-- Move File Dialog -->
    <!-- edited by claude on 2026.01.24.18.50 -->
    <FileMoveDialog
      v-model="moveDialog"
      :current-folder-path="selectedFileForMove?.metadata?._path || ''"
      :current-file-name="getFileName(selectedFileForMove?.metadata?._originalFileName || selectedFileForMove?.fileName || '')"
      :available-folders="availableFoldersForMove"
      @move="handleFileMove"
    />
    <!-- edited by claude on 2026.01.24.19.08 - use _originalFileName and extract filename only -->
    <!-- End of Claude's edit -->

    <!-- edited by claude on 2026.01.24.16.35 -->
    <!-- Move Folder Dialog -->
    <FolderMoveDialog
      v-model="folderMoveDialog"
      :folder-path="selectedFolderForMove?.path || ''"
      :file-count="selectedFolderForMove?.fileCount || 0"
      :available-folders="availableFoldersForFolderMove"
      @move="handleFolderMove"
    />
    <!-- End of Claude's edit -->

    <!-- edited by claude on 2026.01.24.19.35 -->
    <!-- Folder Rename Dialog -->
    <FolderRenameDialog
      v-model="folderRenameDialog"
      :current-folder-path="selectedFolderForRename?.path || ''"
      :current-folder-name="selectedFolderForRename?.name || ''"
      :file-count="selectedFolderForRename?.fileCount || 0"
      @rename="handleFolderRename"
    />

    <!-- Create Folder Dialog -->
    <CreateFolderDialog
      v-model="createFolderDialog"
      :parent-path="newFolderParentPath"
      @create="handleCreateFolder"
    />
    <!-- End of Claude's edit -->

    <!-- Loading Overlay -->
    <FileOperationLoadingOverlay
      :is-visible="operationFeedback.operationState.value.isLoading"
      :title="operationFeedback.operationState.value.loadingMessage"
      :message="'Please wait...'"
    />
    <!-- End of Claude's edit -->
  </v-container>
</template>

<script lang="ts" setup>
// edited by claude on 2026.01.24.14.35
import { ref, computed, onMounted } from 'vue'
import {
  FileStorageService,
  type FileMetadata
} from '@/backend/file-storage.service'
import { PrintQueueService } from '@/backend/print-queue.service'
import { PrintJobService } from '@/backend/print-job.service'
import { usePrinterStore } from '@/store/printer.store'
import { useSnackbar } from '@/shared/snackbar.composable'
import { formatFileSize } from '@/utils/file-size.util'
import {
  formatDate,
  formatRelativeTime,
  formatDuration
} from '@/utils/date-time.utils'
import {
  getPrinterTypeName,
  getPrinterTypeLogo
} from '@/shared/printer-types.constants'
// edited by claude on 2026.01.24.19.37
import { buildFileTree, flattenTree, toggleNodeExpansion, expandAllNodes, collapseAllNodes, type FileTreeNode } from './file-tree-builder.utils'
import { renameFile, moveFile, moveFolder, renameFolder, getParentPath, getFileName } from './file-management.utils'
import { useFileOperationFeedback } from './file-operations-feedback.composable'
import FileRenameDialog from './FileRenameDialog.vue'
import FileMoveDialog from './FileMoveDialog.vue'
import FolderMoveDialog from './FolderMoveDialog.vue'
import FolderRenameDialog from './FolderRenameDialog.vue'
import CreateFolderDialog from './CreateFolderDialog.vue'
import FileOperationLoadingOverlay from './FileOperationLoadingOverlay.vue'
import FileThumbnailCell from './FileThumbnailCell.vue'
// End of Claude's edit

const snackbar = useSnackbar()
const printerStore = usePrinterStore()
const operationFeedback = useFileOperationFeedback()

const thumbnailCache = ref<Map<string, string>>(new Map())

const getThumbnailUrl = (fileStorageId: string, index: number = 0): string => {
  const cacheKey = `${fileStorageId}-${index}`
  if (thumbnailCache.value.has(cacheKey)) {
    return thumbnailCache.value.get(cacheKey)!
  }
  FileStorageService.getThumbnail(fileStorageId, index)
    .then((base64) => {
      thumbnailCache.value.set(cacheKey, base64)
    })
    .catch(() => {})
  return ''
}

const getGCodeThumbnailUrl = (fileStorageId: string, index: number): string => {
  return getThumbnailUrl(fileStorageId, index)
}

const files = ref<FileMetadata[]>([])
const loading = ref(false)
const searchQuery = ref('')
const detailsDialog = ref(false)
const selectedFile = ref<FileMetadata | null>(null)
const queueDialog = ref(false)
const selectedFileForQueue = ref<FileMetadata | null>(null)
const selectedPrinters = ref<number[]>([])
const queuing = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const dragDepth = ref(0)
const uploadProgress = ref<
  Array<{ fileName: string; percent: number; error?: string }>
>([])
const fileInput = ref<HTMLInputElement | null>(null)
const analyzingFiles = ref<Set<string>>(new Set())

// edited by claude on 2026.01.24.14.37
// Tree state management
const fileTree = ref<FileTreeNode[]>([])
// End of Claude's edit

// edited by claude on 2026.01.24.15.47
// Rename dialog state
const renameDialog = ref(false)
const selectedFileForRename = ref<FileMetadata | null>(null)
// End of Claude's edit

// edited by claude on 2026.01.24.16.09
// Move dialog state
const moveDialog = ref(false)
const selectedFileForMove = ref<FileMetadata | null>(null)

// edited by claude on 2026.01.24.18.48
// Extract unique folder paths from all files using metadata._path
const availableFoldersForMove = computed(() => {
  const folders = new Set<string>()
  files.value.forEach(file => {
    const folderPath = file.metadata?._path || ''
    if (folderPath) {
      folders.add(folderPath)
      // Also add parent folders
      let current = folderPath
      while (current.includes('/')) {
        current = getParentPath(current)
        if (current) folders.add(current)
      }
    }
  })
  return Array.from(folders).sort()
})
// End of Claude's edit

// edited by claude on 2026.01.24.16.38
// Folder move dialog state
const folderMoveDialog = ref(false)
const selectedFolderForMove = ref<{ path: string; fileCount: number } | null>(null)

// Get folders excluding the one being moved and its subfolders
const availableFoldersForFolderMove = computed(() => {
  if (!selectedFolderForMove.value) return []

  const movingPath = selectedFolderForMove.value.path
  return availableFoldersForMove.value.filter(folder =>
    folder !== movingPath && !folder.startsWith(`${movingPath}/`)
  )
})

// edited by claude on 2026.01.24.19.39
// Folder rename dialog state
const folderRenameDialog = ref(false)
const selectedFolderForRename = ref<{ path: string; name: string; fileCount: number } | null>(null)

// Create folder dialog state
const createFolderDialog = ref(false)
const newFolderParentPath = ref('')

// edited by claude on 2026.01.24.19.47
// Drag and drop state
const draggingNodeId = ref<string | null>(null)
const dragOverNodeId = ref<string | null>(null)
const draggingNode = ref<FileTreeNode | null>(null)
// End of Claude's edit

const headers = [
  { title: '', key: 'thumbnail', sortable: false, width: '80px' },
  { title: 'File Name', key: 'fileName', sortable: true },
  { title: 'Type', key: 'printerType', sortable: false },
  { title: 'Material', key: 'material', sortable: false },
  { title: 'Temps', key: 'temperatures', sortable: false },
  { title: 'Plates', key: 'plates', sortable: false },
  { title: 'Model', key: 'printerModel', sortable: false },
  { title: 'Print Time', key: 'printTime', sortable: false },
  { title: 'Filament', key: 'filament', sortable: false },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const }
]

const totalCount = computed(() => files.value.length)

const availablePrinters = computed(() => {
  return printerStore.printers.filter((p) => p.enabled)
})

const filteredFiles = computed(() => {
  if (!searchQuery.value) {
    return files.value
  }
  const query = searchQuery.value.toLowerCase()
  return files.value.filter(
    (file) =>
      file.fileName.toLowerCase().includes(query) ||
      file.fileHash.toLowerCase().includes(query) ||
      file.fileStorageId.toLowerCase().includes(query)
  )
})

// edited by claude on 2026.01.24.14.38
// Tree computed properties
const filteredTree = computed(() => {
  if (!searchQuery.value) {
    return fileTree.value
  }
  const query = searchQuery.value.toLowerCase()

  // Filter files first
  const filtered = files.value.filter(file =>
    file.fileName.toLowerCase().includes(query) ||
    (file.metadata?.path || '').toLowerCase().includes(query) ||
    file.fileHash.toLowerCase().includes(query) ||
    file.fileStorageId.toLowerCase().includes(query)
  )

  // Build tree from filtered files
  return buildFileTree(filtered)
})

const flattenedTree = computed(() => {
  return flattenTree(filteredTree.value)
})
// End of Claude's edit

onMounted(async () => {
  await loadFiles()
  await printerStore.loadPrinters()
})

const loadFiles = async () => {
  loading.value = true
  try {
    const response = await FileStorageService.listFiles()
    files.value = response.files
    // edited by claude on 2026.01.24.14.40
    fileTree.value = buildFileTree(response.files)
    // End of Claude's edit
  } catch (error) {
    console.error('Failed to load files:', error)
    snackbar.error('Failed to load files')
  } finally {
    loading.value = false
  }
}

const viewFile = (file: FileMetadata) => {
  selectedFile.value = file
  detailsDialog.value = true
}

const deleteFile = async (file: FileMetadata) => {
  if (!confirm(`Delete file "${file.fileName}"? This cannot be undone.`)) {
    return
  }

  try {
    await FileStorageService.deleteFile(file.fileStorageId)
    snackbar.info('File deleted successfully')
    await loadFiles()
  } catch (error) {
    console.error('Failed to delete file:', error)
    snackbar.error('Failed to delete file')
  }
}

const analyzeFile = async (file: FileMetadata) => {
  if (analyzingFiles.value.has(file.fileStorageId)) {
    return
  }

  analyzingFiles.value.add(file.fileStorageId)

  try {
    const result = await FileStorageService.analyzeFile(file.fileStorageId)
    snackbar.info(
      `Analysis complete! Found ${result.thumbnailCount} thumbnail(s)`
    )

    await loadFiles()
  } catch (error) {
    console.error('Failed to analyze file:', error)
    snackbar.error('Failed to analyze file')
  } finally {
    analyzingFiles.value.delete(file.fileStorageId)
  }
}

// edited by claude on 2026.01.24.21.15 - renamed to avoid conflict with tree drag handlers
const handleUploadDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleUploadDragEnter = (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value++
  if (dragDepth.value === 1) {
    isDragging.value = true
  }
}

const handleUploadDragLeave = (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value--
  if (dragDepth.value === 0) {
    isDragging.value = false
  }
}

const handleUploadDrop = async (e: DragEvent) => {
  e.preventDefault()
  dragDepth.value = 0
  isDragging.value = false
  const droppedFiles = Array.from(e.dataTransfer?.files || [])
  await uploadFiles(droppedFiles)
}
// End of Claude's edit

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  await uploadFiles(selectedFiles)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFiles = async (filesToUpload: File[]) => {
  if (filesToUpload.length === 0) return

  uploading.value = true
  uploadProgress.value = filesToUpload.map((f) => ({
    fileName: f.name,
    percent: 0
  }))

  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i]
    try {
      // Upload to the file upload endpoint using service
      await FileStorageService.uploadFile(file)

      uploadProgress.value[i].percent = 100
      snackbar.info(`Uploaded ${file.name}`)
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error)
      uploadProgress.value[i].error = 'Failed'
      uploadProgress.value[i].percent = 100
      snackbar.error(`Failed to upload ${file.name}`)
    }
  }

  uploading.value = false

  // Reload files after upload
  setTimeout(() => {
    uploadProgress.value = []
    loadFiles()
  }, 2000)
}

const openQueueDialog = (file: FileMetadata) => {
  selectedFileForQueue.value = file
  selectedPrinters.value = []
  queueDialog.value = true
}

const togglePrinterSelection = (printerId: number) => {
  const index = selectedPrinters.value.indexOf(printerId)
  if (index > -1) {
    selectedPrinters.value.splice(index, 1)
  } else {
    selectedPrinters.value.push(printerId)
  }
}

const queueToSelectedPrinters = async () => {
  if (!selectedFileForQueue.value || selectedPrinters.value.length === 0) {
    return
  }

  queuing.value = true
  let successCount = 0
  let failCount = 0

  try {
    // First, create a pending job for this file (without a printer)
    // We'll need to call the backend to create a job from the file storage
    for (const printerId of selectedPrinters.value) {
      try {
        // Create a print job from the file
        const job = await PrintJobService.createFromFile(
          selectedFileForQueue.value.fileStorageId,
          printerId
        )

        // Add the job to the printer's queue
        await PrintQueueService.addToQueue(printerId, job.id)
        successCount++
      } catch (error) {
        console.error(`Failed to queue to printer ${printerId}:`, error)
        failCount++
      }
    }

    if (successCount > 0) {
      snackbar.info(`Queued file to ${successCount} printer(s)`)
    }
    if (failCount > 0) {
      snackbar.error(`Failed to queue to ${failCount} printer(s)`)
    }

    queueDialog.value = false
    selectedFileForQueue.value = null
    selectedPrinters.value = []
  } catch (error) {
    console.error('Failed to queue file:', error)
    snackbar.error('Failed to queue file')
  } finally {
    queuing.value = false
  }
}

// edited by claude on 2026.01.24.15.06
// Tree manipulation functions
const toggleExpansion = (nodeId: string) => {
  fileTree.value = toggleNodeExpansion(fileTree.value, nodeId)
}

const expandAll = () => {
  fileTree.value = expandAllNodes(fileTree.value)
}

const collapseAll = () => {
  fileTree.value = collapseAllNodes(fileTree.value)
}
// End of Claude's edit

// edited by claude on 2026.01.24.15.48
// File rename handlers
const openRenameDialog = (file: FileMetadata) => {
  selectedFileForRename.value = file
  renameDialog.value = true
}

const handleFileRename = async (newName: string) => {
  // edited by claude on 2026.01.24.18.56
  if (!selectedFileForRename.value) return

  const file = selectedFileForRename.value
  const result = await operationFeedback.executeOperation(
    'rename',
    'Renaming file...',
    `File renamed to "${newName}" successfully`,
    async () => {
      await renameFile(file.fileStorageId, newName)
    }
  )

  if (result !== null) {
    // Reload files to show updated name
    await loadFiles()
  }
  // End of Claude's edit
}

// edited by claude on 2026.01.24.16.10
// File move handlers
const openMoveDialog = (file: FileMetadata) => {
  selectedFileForMove.value = file
  moveDialog.value = true
}

const handleFileMove = async (newPath: string) => {
  if (!selectedFileForMove.value) return

  const file = selectedFileForMove.value
  const result = await operationFeedback.executeOperation(
    'move',
    'Moving file...',
    `File moved successfully`,
    async () => {
      await moveFile(file.fileStorageId, newPath)
    }
  )

  if (result !== null) {
    // Reload files to show updated location
    await loadFiles()
  }
}

// edited by claude on 2026.01.24.16.40
// Folder move handlers
const openFolderMoveDialog = (node: FileTreeNode) => {
  // edited by claude on 2026.01.24.19.00
  if (node.type !== 'folder') return

  // Count files in this folder using metadata._path
  const folderPath = node.path || node.name
  const fileCount = files.value.filter(file => {
    const filePath = file.metadata?._path || ''
    return filePath === folderPath || filePath.startsWith(`${folderPath}/`)
  }).length

  selectedFolderForMove.value = {
    path: folderPath,
    fileCount
  }
  folderMoveDialog.value = true
  // End of Claude's edit
}

const handleFolderMove = async (newPath: string) => {
  if (!selectedFolderForMove.value) return

  const folder = selectedFolderForMove.value
  const result = await operationFeedback.executeOperation(
    'move',
    `Moving folder with ${folder.fileCount} file(s)...`,
    `Folder moved successfully`,
    async () => {
      await moveFolder(folder.path, newPath, files.value)
    }
  )

  if (result !== null) {
    // Reload files to show updated location
    await loadFiles()
  }
}

// edited by claude on 2026.01.24.19.40
// Folder rename handlers
const openFolderRenameDialog = (node: FileTreeNode) => {
  if (node.type !== 'folder') return

  const folderPath = node.path || node.name
  const fileCount = files.value.filter(file => {
    const filePath = file.metadata?._path || ''
    return filePath === folderPath || filePath.startsWith(`${folderPath}/`)
  }).length

  selectedFolderForRename.value = {
    path: folderPath,
    name: node.name,
    fileCount
  }
  folderRenameDialog.value = true
}

const handleFolderRename = async (newFolderName: string) => {
  if (!selectedFolderForRename.value) return

  const folder = selectedFolderForRename.value
  const result = await operationFeedback.executeOperation(
    'rename',
    `Renaming folder with ${folder.fileCount} file(s)...`,
    `Folder renamed successfully`,
    async () => {
      await renameFolder(folder.path, newFolderName, files.value)
    }
  )

  if (result !== null) {
    await loadFiles()
  }
}

// Create folder handlers
const openCreateFolderDialog = (parentPath: string) => {
  newFolderParentPath.value = parentPath
  createFolderDialog.value = true
}

const handleCreateFolder = async (folderPath: string) => {
  // In virtual file system, folders don't need to be created explicitly
  // They exist when files are placed in them
  // Show success message to user
  operationFeedback.operationState.value = {
    isLoading: false,
    operationType: null,
    loadingMessage: ''
  }
  snackbar.info(`Folder "${folderPath}" will be created when you add files to it`)
}

// Delete folder handler
const confirmDeleteFolder = async (node: FileTreeNode) => {
  if (node.type !== 'folder') return

  const folderPath = node.path || node.name
  const filesInFolder = files.value.filter(file => {
    const filePath = file.metadata?._path || ''
    return filePath === folderPath || filePath.startsWith(`${folderPath}/`)
  })

  if (filesInFolder.length === 0) {
    snackbar.info('Folder is empty - it will disappear automatically')
    return
  }

  // Show confirmation dialog
  const confirmed = confirm(
    `Delete folder "${node.name}" and all ${filesInFolder.length} file(s) inside?\n\nThis action cannot be undone.`
  )

  if (!confirmed) return

  const result = await operationFeedback.executeOperation(
    'delete',
    `Deleting ${filesInFolder.length} file(s)...`,
    `Folder deleted successfully`,
    async () => {
      // Delete all files in the folder
      await Promise.all(
        filesInFolder.map(file => FileStorageService.deleteFile(file.fileStorageId))
      )
    }
  )

  if (result !== null) {
    await loadFiles()
  }
}

// edited by claude on 2026.01.24.19.48
// Drag and drop handlers
const handleDragStart = (node: FileTreeNode, event: DragEvent) => {
  draggingNodeId.value = node.id
  draggingNode.value = node

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', node.id)
  }
}

const handleDragEnd = () => {
  draggingNodeId.value = null
  dragOverNodeId.value = null
  draggingNode.value = null
}

const handleDragOver = (node: FileTreeNode, event: DragEvent) => {
  if (!draggingNode.value || draggingNode.value.id === node.id) return

  // Only allow dropping into folders
  if (node.type === 'folder') {
    dragOverNodeId.value = node.id
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }
}

const handleDragLeave = (node: FileTreeNode) => {
  if (dragOverNodeId.value === node.id) {
    dragOverNodeId.value = null
  }
}

const handleDrop = async (targetNode: FileTreeNode, event: DragEvent) => {
  dragOverNodeId.value = null

  if (!draggingNode.value || draggingNode.value.id === targetNode.id) return

  // Only allow dropping into folders
  if (targetNode.type !== 'folder') {
    snackbar.error('Can only drop into folders')
    return
  }

  const sourceNode = draggingNode.value
  const targetFolderPath = targetNode.path || targetNode.name

  // Prevent dropping folder into itself or its subfolders
  if (sourceNode.type === 'folder') {
    const sourcePath = sourceNode.path || sourceNode.name
    if (targetFolderPath === sourcePath || targetFolderPath.startsWith(`${sourcePath}/`)) {
      snackbar.error('Cannot move folder into itself or its subfolders')
      return
    }
  }

  // Perform the move
  if (sourceNode.type === 'file' && sourceNode.file) {
    // Move file
    const result = await operationFeedback.executeOperation(
      'move',
      'Moving file...',
      `File moved to "${targetNode.name}"`,
      async () => {
        await moveFile(sourceNode.file!.fileStorageId, targetFolderPath)
      }
    )

    if (result !== null) {
      await loadFiles()
    }
  } else if (sourceNode.type === 'folder') {
    // Move folder
    const sourcePath = sourceNode.path || sourceNode.name
    const fileCount = files.value.filter(file => {
      const filePath = file.metadata?._path || ''
      return filePath === sourcePath || filePath.startsWith(`${sourcePath}/`)
    }).length

    // Calculate new path for folder
    const newFolderPath = `${targetFolderPath}/${sourceNode.name}`

    const result = await operationFeedback.executeOperation(
      'move',
      `Moving folder with ${fileCount} file(s)...`,
      `Folder moved to "${targetNode.name}"`,
      async () => {
        await moveFolder(sourcePath, newFolderPath, files.value)
      }
    )

    if (result !== null) {
      await loadFiles()
    }
  }

  draggingNode.value = null
}
// End of Claude's edit
</script>

<style scoped>
.files-table {
  background-color: transparent;
}

.upload-drop-zone {
  transition: all 0.3s ease;
  border: 2px dashed transparent;
}

.upload-drop-zone.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: scale(1.01);
}

/* edited by claude on 2026.01.24.14.43 */
/* Tree Table Styles */
.tree-table-container {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.tree-table-header {
  display: grid;
  grid-template-columns: 60px minmax(250px, 1fr) 80px 120px 100px 80px 140px 120px 250px; /* edited by claude on 2026.01.24.18.15 - increased actions column from 200px to 250px */
  gap: 8px;
  padding: 12px 16px;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  font-weight: 600;
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.12);
}

.tree-table-body {
  max-height: 600px;
  overflow-y: auto;
}

.tree-table-row {
  display: grid;
  grid-template-columns: 60px minmax(250px, 1fr) 80px 120px 100px 80px 140px 120px 250px; /* edited by claude on 2026.01.24.18.15 - increased actions column from 200px to 250px */
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  transition: background-color 0.2s ease;
}

.tree-table-row:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.04);
}

.tree-table-row.is-folder {
  background-color: rgba(var(--v-theme-primary), 0.02);
}

.tree-table-row.is-folder:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}

/* edited by claude on 2026.01.24.19.50 */
.tree-table-row.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

.tree-table-row.drag-over {
  background-color: rgba(var(--v-theme-primary), 0.15) !important;
  border: 2px dashed rgba(var(--v-theme-primary), 0.5);
}

.tree-table-row {
  cursor: grab;
}

.tree-table-row:active {
  cursor: grabbing;
}
/* End of Claude's edit */

.tree-cell {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.cell-thumbnail {
  justify-content: center;
}

.cell-name {
  min-width: 0;
}

.cell-type,
.cell-material,
.cell-temps,
.cell-plates,
.cell-time,
.cell-filament {
  justify-content: center;
}

/* edited by claude on 2026.01.24.21.20 - center actions header, keep items right-aligned */
.tree-table-header .cell-actions {
  justify-content: center;
}

.tree-table-row .cell-actions {
  justify-content: flex-end;
}
/* End of Claude's edit */

/* Scrollbar styling */
.tree-table-body::-webkit-scrollbar {
  width: 8px;
}

.tree-table-body::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 4px;
}

.tree-table-body::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 4px;
}

.tree-table-body::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-on-surface), 0.3);
}
/* End of Claude's edit */
</style>
