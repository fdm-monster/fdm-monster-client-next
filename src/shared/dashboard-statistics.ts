import type { PrintJobDto, PrintJobStatus } from '@/backend/print-job.service'

/**
 * Dashboard statistics utilities
 * This file contains shared functions for calculating dashboard performance insights
 * To be refactored and expanded in the future
 */

export interface JobPerformanceMetrics {
  successRate: number
  activeJobs: number
  completedLast24h: number
  failedLast24h: number
  averagePrintTimeHours: number
  totalPrintTimeHours: number
}

/**
 * Calculate success rate from jobs
 * @param jobs - Array of print jobs
 * @param timeWindowHours - Time window in hours (default 24)
 * @returns Success rate as a percentage (0-100)
 */
export function calculateSuccessRate(jobs: PrintJobDto[], timeWindowHours: number = 24): number {
  const cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000

  const recentJobs = jobs.filter(job => {
    const jobTime = job.endedAt ? new Date(job.endedAt).getTime() : new Date(job.createdAt).getTime()
    return jobTime >= cutoffTime && (job.status === 'COMPLETED' || job.status === 'FAILED')
  })

  if (recentJobs.length === 0) return 0

  const successfulJobs = recentJobs.filter(job => job.status === 'COMPLETED').length
  return Math.round((successfulJobs / recentJobs.length) * 100)
}

/**
 * Count active (printing or starting) jobs
 * @param jobs - Array of print jobs
 * @returns Number of active jobs
 */
export function countActiveJobs(jobs: PrintJobDto[]): number {
  return jobs.filter(job =>
    job.status === 'PRINTING' || job.status === 'STARTING'
  ).length
}

/**
 * Count jobs with specific status in time window
 * @param jobs - Array of print jobs
 * @param status - Status to count
 * @param timeWindowHours - Time window in hours (default 24)
 * @returns Number of jobs with the given status
 */
export function countJobsByStatus(
  jobs: PrintJobDto[],
  status: PrintJobStatus,
  timeWindowHours: number = 24
): number {
  const cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000

  return jobs.filter(job => {
    if (job.status !== status) return false
    const jobTime = job.endedAt ? new Date(job.endedAt).getTime() : new Date(job.createdAt).getTime()
    return jobTime >= cutoffTime
  }).length
}

/**
 * Calculate average print time from completed jobs
 * @param jobs - Array of print jobs
 * @param timeWindowHours - Time window in hours (default 24)
 * @returns Average print time in hours
 */
export function calculateAveragePrintTime(jobs: PrintJobDto[], timeWindowHours: number = 24): number {
  const cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000

  const completedJobs = jobs.filter(job => {
    if (job.status !== 'COMPLETED' || !job.statistics?.actualPrintTimeSeconds) return false
    const jobTime = job.endedAt ? new Date(job.endedAt).getTime() : new Date(job.createdAt).getTime()
    return jobTime >= cutoffTime
  })

  if (completedJobs.length === 0) return 0

  const totalSeconds = completedJobs.reduce((sum, job) =>
    sum + (job.statistics?.actualPrintTimeSeconds || 0), 0
  )

  return totalSeconds / completedJobs.length / 3600 // Convert to hours
}

/**
 * Calculate total print time from jobs
 * @param jobs - Array of print jobs
 * @param timeWindowHours - Time window in hours (default 24)
 * @returns Total print time in hours
 */
export function calculateTotalPrintTime(jobs: PrintJobDto[], timeWindowHours: number = 24): number {
  const cutoffTime = Date.now() - timeWindowHours * 60 * 60 * 1000

  const recentJobs = jobs.filter(job => {
    if (!job.statistics?.actualPrintTimeSeconds) return false
    const jobTime = job.endedAt ? new Date(job.endedAt).getTime() : new Date(job.createdAt).getTime()
    return jobTime >= cutoffTime
  })

  const totalSeconds = recentJobs.reduce((sum, job) =>
    sum + (job.statistics?.actualPrintTimeSeconds || 0), 0
  )

  return totalSeconds / 3600 // Convert to hours
}

/**
 * Format hours to human-readable string
 * @param hours - Number of hours
 * @returns Formatted string (e.g., "2h 34m")
 */
export function formatPrintTime(hours: number): string {
  if (hours === 0) return '0m'

  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)

  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Calculate all job performance metrics
 * @param jobs - Array of print jobs
 * @param timeWindowHours - Time window in hours (default 24)
 * @returns Object containing all performance metrics
 */
export function calculateJobPerformanceMetrics(
  jobs: PrintJobDto[],
  timeWindowHours: number = 24
): JobPerformanceMetrics {
  return {
    successRate: calculateSuccessRate(jobs, timeWindowHours),
    activeJobs: countActiveJobs(jobs),
    completedLast24h: countJobsByStatus(jobs, 'COMPLETED', timeWindowHours),
    failedLast24h: countJobsByStatus(jobs, 'FAILED', timeWindowHours),
    averagePrintTimeHours: calculateAveragePrintTime(jobs, timeWindowHours),
    totalPrintTimeHours: calculateTotalPrintTime(jobs, timeWindowHours)
  }
}

