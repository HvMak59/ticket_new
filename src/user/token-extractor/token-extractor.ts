import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const Token = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();

        // Grab the authorization header
        let authHeader = request.headers['authorization'] || request.headers['Authorization'];

        if (!authHeader) return null;

        // If it's an array, take the first value
        if (Array.isArray(authHeader)) {
            authHeader = authHeader[0];
        }

        // Now it's guaranteed to be a string, split "Bearer <token>"
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            return parts[1];
        }

        // fallback: return the raw string if no "Bearer"
        return authHeader;
    },
);