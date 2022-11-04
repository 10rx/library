/* eslint-disable @typescript-eslint/naming-convention */
import axios, { AxiosInstance, AxiosError, Method } from 'axios';
import { TenrxAccessTokenInvalid, PromotionResponse } from '../index.js';

interface PromotionToken {
  token: string;
  expiresAt: Date;
}

export default class TenrxPromotionEngine {
  private token: PromotionToken | null = null;
  private axios: AxiosInstance;

  constructor(url: string) {
    this.axios = axios.create({
      baseURL: url,
    });
  }

  private checkToken() {
    if (!this.token) throw new TenrxAccessTokenInvalid('No promotion token set', undefined);
    if (this.token.expiresAt <= new Date()) throw new TenrxAccessTokenInvalid('Promotion token is expired', undefined);
  }

  public async login(token: string) {
    try {
      const response = await this.request<PromotionToken>({
        slug: '/v1/auth/login',
        method: 'post',
        body: { token },
      });
      if (response.statusCode !== 200) return response.message;
      this.token = response.data;
      return null;
    } catch (error) {
      return (error as Error).message;
    }
  }

  public async request<T>({
    slug,
    method,
    body,
    params,
    headers,
    skipAuth,
  }: {
    slug: string;
    method: Method;
    body?: object;
    params?: Record<string, string | number>;
    headers?: Record<string, string | number>;
    skipAuth?: boolean;
  }) {
    if (!skipAuth) this.checkToken();
    try {
      const response = await this.axios({
        url: slug,
        method,
        headers: skipAuth
          ? headers
          : {
              Authorization: this.token?.token as string,
              ...headers,
            },
        params,
        data: body,
      });

      return response.data as PromotionResponse<T>;
    } catch (error) {
      throw new Error((error as AxiosError).message);
    }
  }
}
