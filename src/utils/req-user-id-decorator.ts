import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getUserIdFromReq } from './other';

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const host = context.switchToHttp();
    const request = host.getRequest<Request>();
    return getUserIdFromReq(request);
  },
);