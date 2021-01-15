export default class AppError {
    public code: string;
    public message: string;

    constructor(code: string, message: string) {
        this.message = message;
        this.code = code;
    }
}