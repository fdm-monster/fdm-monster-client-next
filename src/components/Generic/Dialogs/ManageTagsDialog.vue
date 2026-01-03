<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="500"
    @escape="closeDialog()"
    @opened="onDialogOpened"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">label</v-icon>
        Manage Tags
      </v-card-title>
      <v-card-text>
        <div class="mb-4">
          <div class="text-subtitle-2 mb-2">Available Tags:</div>

          <!-- Tag chips display -->
          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="tag of tagsWithPrinters"
              :key="tag.id"
              :color="tag.color"
              :disabled="editingTagId !== null"
              closable
              size="small"
              @click="startEditingTag(tag.id, tag.name)"
              @click:close="deleteTag(tag.id)"
            >
              <v-icon start size="x-small">label</v-icon>
              {{ tag.name }}
            </v-chip>
            <v-chip
              v-if="!tagsWithPrinters.length"
              disabled
              size="small"
            >
              No tags yet
            </v-chip>
          </div>
        </div>

        <!-- Edit mode - full width when active -->
        <v-card v-if="editingTagId !== null" variant="elevated" elevation="10" color="secondary" class="mb-3 pa-3">
          <div class="text-caption mb-2">Editing Tag:</div>
          <div class="mb-3">
            <v-text-field
              v-model="editingTagName"
              density="compact"
              variant="outlined"
              hide-details
              autofocus
              label="Tag Name"
              placeholder="Enter tag name"
              @keyup.enter="updateTagName(editingTagId)"
              @keyup.escape="cancelEditingTag()"
            />
          </div>
          <div class="mb-3">
            <div class="text-caption mb-2">Tag Color:</div>
            <v-color-picker
              v-model="editingTagColor"
              :swatches="colorSwatches"
              show-swatches
              hide-inputs
              mode="hex"
            />
          </div>
          <div class="d-flex ga-2">
            <v-btn
              color="primary"
              prepend-icon="check"
              @click="updateTagName(editingTagId)"
            >
              Save
            </v-btn>
            <v-btn
              variant="outlined"
              prepend-icon="close"
              @click="cancelEditingTag()"
            >
              Cancel
            </v-btn>
          </div>
        </v-card>

        <v-divider class="my-4"/>

        <div>
          <div class="text-subtitle-2 mb-2">Create New Tag:</div>
          <v-text-field
            v-model="newTagName"
            label="Tag Name"
            placeholder="Enter tag name"
            density="compact"
            variant="outlined"
            hide-details
            class="mb-3"
            @keyup.enter="createTag()"
          />
          <div class="mb-3">
            <div class="text-caption mb-2">Tag Color:</div>
            <v-color-picker
              v-model="newTagColor"
              :swatches="colorSwatches"
              show-swatches
              hide-inputs
              mode="hex"
            />
          </div>
          <v-btn
            color="primary"
            size="small"
            prepend-icon="add"
            @click="createTag()"
          >
            Create Tag
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn @click="closeDialog()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDialog } from '@/shared/dialog.composable'
import { DialogName } from '@/components/Generic/Dialogs/dialog.constants'
import { useSnackbar } from '@/shared/snackbar.composable'
import { PrinterTagService, TagWithPrintersDto } from '@/backend/printer-tag.service'
import BaseDialog from '@/components/Generic/Dialogs/BaseDialog.vue'
import { useInvalidatePrinterTags } from '@/queries/printer-tags.query'
import { DEFAULT_TAG_COLOR } from '@/shared/tag.constants'

const dialog = useDialog(DialogName.ManageTagsDialog)
const invalidatePrinterTags = useInvalidatePrinterTags()
const snackbar = useSnackbar()

const tagsWithPrinters = ref<TagWithPrintersDto[]>([])
const newTagName = ref('')
const newTagColor = ref(DEFAULT_TAG_COLOR)
const editingTagId = ref<number | null>(null)
const editingTagName = ref('')
const editingTagColor = ref(DEFAULT_TAG_COLOR)

const colorSwatches = [
  ['#FF5252', '#E91E63', '#9C27B0', '#673AB7'],
  ['#3F51B5', '#2196F3', '#03A9F4', '#00BCD4'],
  ['#009688', '#4CAF50', '#8BC34A', '#CDDC39'],
  ['#FFEB3B', '#FFC107', '#FF9800', '#FF5722'],
  ['#795548', '#9E9E9E', '#607D8B', '#000000']
]

const closeDialog = () => {
  dialog.closeDialog()
  // Reset editing state when closing
  editingTagId.value = null
  editingTagName.value = ''
  editingTagColor.value = DEFAULT_TAG_COLOR
  newTagName.value = ''
  newTagColor.value = DEFAULT_TAG_COLOR
}

const onDialogOpened = async (context?: { tagId?: number; tagName?: string }) => {
  await loadTags()

  // If context contains tagId, auto-start editing that tag
  if (context?.tagId && context?.tagName) {
    startEditingTag(context.tagId, context.tagName)
  }
}

const loadTags = async () => {
  tagsWithPrinters.value = await PrinterTagService.getTagsWithPrinters()
}

const createTag = async () => {
  if (!newTagName.value?.trim()?.length) {
    snackbar.error('Please set a non-empty tag name')
    return
  }

  await PrinterTagService.createTag(newTagName.value.trim(), newTagColor.value)
  await loadTags()

  // Invalidate queries to refresh data in other components
  await invalidatePrinterTags()

  newTagName.value = ''
  newTagColor.value = DEFAULT_TAG_COLOR
  snackbar.info('Created tag')
}

const deleteTag = async (tagId: number) => {
  const existingTag = tagsWithPrinters.value.find((g) => g.id === tagId)
  if (!existingTag) {
    snackbar.error('Tag was not found, please reload the page')
    return
  }

  const printerCount = existingTag.printers.length
  if (
    printerCount > 0 &&
    !confirm(
      `This tag contains ${printerCount} printers, are you sure to delete it?`
    )
  ) {
    return
  }

  await PrinterTagService.deleteTag(tagId)
  await loadTags()

  // Invalidate queries to refresh data in other components
  await invalidatePrinterTags()

  snackbar.info('Deleted tag')
}

const startEditingTag = (tagId: number, currentName: string) => {
  const tag = tagsWithPrinters.value.find(t => t.id === tagId)
  editingTagId.value = tagId
  editingTagName.value = currentName
  editingTagColor.value = tag?.color || DEFAULT_TAG_COLOR
}

const cancelEditingTag = () => {
  editingTagId.value = null
  editingTagName.value = ''
  editingTagColor.value = DEFAULT_TAG_COLOR
}

const updateTagName = async (tagId: number) => {
  if (!editingTagName.value?.trim()?.length) {
    snackbar.error('Please set a non-empty tag name')
    return
  }

  await PrinterTagService.updateTagName(tagId, editingTagName.value.trim())
  await PrinterTagService.updateTagColor(tagId, editingTagColor.value)
  await loadTags()

  // Invalidate queries to refresh data in other components
  await invalidatePrinterTags()

  editingTagId.value = null
  editingTagName.value = ''
  editingTagColor.value = DEFAULT_TAG_COLOR
  snackbar.info('Updated tag')
}
</script>

