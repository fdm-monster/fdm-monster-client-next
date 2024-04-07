<template>
  <BaseDialog
    :id="dialog.dialogId"
    max-width="700px"
    @escape="closeDialog()">
    <v-card class="pa-4">
      <v-card-title>
        <span class="text-h5">
          Batch Import JSON printers
        </span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            v-slot="{ errors }"
            name="JSON"
            rules="required|json">
            <v-textarea
              v-model="formData.json"
              data-vv-validate-on="change|blur"
              rows="10"
              @change="updatePrinterCount()">
              <template #label>
                <div>
                  JSON import <small>
                    (optional)
                  </small>
                </div>
              </template>
            </v-textarea>
            {{ numPrinters }} printers found
          </v-col>
        </v-row>
        <v-btn class="mt-2">
          Validate printers
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <em class="text-red">
          * indicates required field
        </em>
        <v-spacer />
        <v-btn
          variant="text"
          @click="closeDialog()">
          Close
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="submit()">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </BaseDialog>
</template>

<script lang="ts" setup>
import {PrintersService} from '@/backend'
import {DialogName} from '@/components/Generic/Dialogs/dialog.constants'
import {useDialog} from '@/shared/dialog.composable'

const dialog = useDialog(DialogName.BatchJsonCreate)

const formData = {
  json: ''
}

let numPrinters = 0

const parsedPrinters = async () => {
  const data = JSON.parse(formData.json)
  if (!Array.isArray(data)) return []
  return data
}

const updatePrinterCount = async () => {
  numPrinters = (await parsedPrinters()).length
}

const submit = async () => {
  const printers = await parsedPrinters()

  const numPrinters = printers.length
  const answer = confirm(`Are you sure to import ${numPrinters} printers?`)
  if (answer) {
    printers.forEach((p) => {
      if (p['_id']) {
        delete p['_id']
      }
      if (p['apikey']) {
        p.apiKey = p['apikey']
        delete p['apikey']
      }
      if (p['settingsApperance']) {
        p.settingsAppearance = p['settingsApperance']
        delete p['settingsApperance']
      }
      if (p['name']) {
        if (!p.settingsAppearance) {
          p.settingsAppearance = {}
        }
        p.settingsAppearance.name = p['name']
        delete p['name']
      }
    })
    await PrintersService.batchImportPrinters(printers)
  }

  closeDialog()
}

const closeDialog = () => {
  dialog.closeDialog()
}

</script>
