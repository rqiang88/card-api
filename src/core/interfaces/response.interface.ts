export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  timestamp: string
}
