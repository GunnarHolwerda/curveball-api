export interface ISendCodeResponse {
    carrier?: string;
    is_cellphone?: boolean;
    message: string;
    seconds_to_expire: number;
    uuid: string;
    success: boolean;
}