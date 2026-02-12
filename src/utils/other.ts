import { ExtractJwt } from 'passport-jwt';
import { jwtDecode } from 'jwt-decode';

import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Metric } from 'src/metrics/entities/metric.entity';
import { MetricsFrequency } from 'src/common';


export function getUserIdFromReq(req: Request) {
  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  const decodedToken = jwtDecode(token!);
  console.log(decodedToken);
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

export function getBearerToken(token?: string): string {
  if (!token) {
    throw new Error('Authorization token is missing');
  }

  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
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

export function getMetricDTO(metric: Partial<Metric>) {
  console.log(metric);
  // const { txnCaptureTime, frequency, metricsAttributeId, unit, ...metricDto } =
  const { frequency, metricsAttributeId, unit, ...metricDto } =
    metric;
  return metricDto;
}

export function getPeriodTime(
  txnCaptureTime: Date,
  frequency?: MetricsFrequency,
): Date {
  let txnDate = new Date(txnCaptureTime);
  let txnCapturePeriod: Date;
  switch (frequency) {
    case MetricsFrequency.INSTANT:
      txnCapturePeriod = txnDate;
      break;
    /* case MetricsFrequency.WEEKLY:
      break; */
    case MetricsFrequency.DAILY:
      txnCapturePeriod = new Date(
        txnDate.getFullYear(),
        txnDate.getMonth(),
        txnDate.getDate(),
      );
      break;
    case MetricsFrequency.MONTHLY:
      txnCapturePeriod = new Date(txnDate.getFullYear(), txnDate.getMonth());
      break;
    /* case MetricsFrequency.QUARTERLY:
      break; */
    case MetricsFrequency.YEARLY:
    case MetricsFrequency.TOTAL:
      txnCapturePeriod = new Date(txnDate.getFullYear(), 0);
      break;
    default:
      txnCapturePeriod = txnCaptureTime;
      break;
  }
  return txnCapturePeriod;
}

