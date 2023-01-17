export interface BaseResponse<T> {
    data?: T
    status: "success" | "error"
    message?: string
}
