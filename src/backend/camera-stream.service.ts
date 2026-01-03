import { BaseService } from './base.service'
import {
  CameraStream,
  CreateCameraStreamDto
} from '@/models/camera-streams/camera-stream'

export class CameraStreamService extends BaseService {
  static async listCameraStreams() {
    return await this.get<CameraStream[]>('/api/v2/camera-stream/')
  }

  static async createCameraStream(cameraStreamDto: CreateCameraStreamDto) {
    return await this.post<CameraStream>('/api/v2/camera-stream/', cameraStreamDto)
  }

  static async getCameraStream(cameraStreamId: string | number) {
    return await this.get<CameraStream>(`/api/v2/camera-stream/${cameraStreamId}`)
  }

  static async updateCameraStream(
    cameraStreamId: string | number,
    cameraStreamDto: CreateCameraStreamDto
  ) {
    return await this.put<CameraStream>(
      `/api/v2/camera-stream/${cameraStreamId}`,
      cameraStreamDto
    )
  }

  static async deleteCameraStream(cameraStreamId: string | number) {
    return await this.delete(`/api/v2/camera-stream/${cameraStreamId}`)
  }
}
