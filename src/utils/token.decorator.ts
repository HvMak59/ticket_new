// token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { getBearerToken } from './other';
import { ExtractJwt } from 'passport-jwt';

export const Token = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        // return getTokenFromReq(request);
        const authHeader = request.headers.authorization;

        // console.log(ExtractJwt.fromAuthHeaderAsBearerToken()(request));

        return getBearerToken(authHeader)
    },
);
