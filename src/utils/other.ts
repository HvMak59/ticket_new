import { ExtractJwt } from 'passport-jwt';
import { jwtDecode } from 'jwt-decode';

import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';


export function getUserIdFromReq(req: Request) {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  const decodedToken = jwtDecode(token!);
  // console.log(decodedToken);
  return decodedToken.sub;
}

export function convertInputToDate(input: string | number | Date): Date {
  if (input instanceof Date) {
    return input;
  }

  const date = new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date input: ${input}`);
  }

  return date;
}


export function getTokenString(token: string): string {
  if (!token) {
    throw new Error('Authorization token is missing');
  }

  // If already prefixed, return as-is
  if (token.startsWith('Bearer ')) {
    return token;
  }

  return `Bearer ${token}`;
}


export function throwErrIfSrvcRespFailure<T>(
  response: AxiosResponse<T>,
): void {
  if (!response) {
    throw new InternalServerErrorException(
      'No response received from service',
    );
  }

  const { status, data } = response;

  // Accept only success status codes
  if (status < 200 || status >= 300) {
    throw new BadRequestException({
      message: 'Service call failed',
      statusCode: status,
      data,
    });
  }

  if (!data) {
    throw new InternalServerErrorException(
      'Empty response from service',
    );
  }
}

