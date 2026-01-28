import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        // If it's a Nest HttpException
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            message =
                typeof res === 'string'
                    ? res
                    : (res as any).message || message;
        }

        // PostgreSQL / TypeORM error
        else if (exception?.driverError?.detail) {
            message = exception.driverError.detail;
        } else if (exception?.message) {
            message = exception.message;
        }

        response.status(status).json({
            statusCode: status,
            path: request.url,
            message,
        });
    }
}