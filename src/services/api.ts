import axios from 'axios';
import { getToken } from './session';

// `status` is undefined when the server could not be reached.
export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

export const SERVER_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${SERVER_URL}/api/v1`,
  timeout: 15000,
});

api.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const logResponse = (
  method: string | undefined,
  url: string | undefined,
  status: number | string | undefined,
  data: unknown,
) => {
  if (__DEV__) {
    console.log(
      `[API] ${method?.toUpperCase()} ${url} ${status}`,
      JSON.stringify(
        data,
        (key, value) => (key === 'token' ? '[hidden]' : value),
        2,
      ),
    );
  }
};

api.interceptors.response.use(
  response => {
    logResponse(
      response.config.method,
      response.config.url,
      response.status,
      response.data,
    );
    return response;
  },
  error => {
    logResponse(
      error.config?.method,
      error.config?.url,
      error.response?.status ?? error.code,
      error.response?.data ?? error.message,
    );
    throw new ApiError(
      error.response?.data?.message ??
        (error.response
          ? 'Something went wrong. Please try again.'
          : "Can't reach the server. Check your connection and try again."),
      error.response?.status,
    );
  },
);
