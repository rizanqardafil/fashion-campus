/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { app__schemas__user__GetOrders } from '../models/app__schemas__user__GetOrders';
import type { DefaultResponse } from '../models/DefaultResponse';
import type { GetUser } from '../models/GetUser';
import type { GetUserAddress } from '../models/GetUserAddress';
import type { GetUserBalance } from '../models/GetUserBalance';
import type { PutUserAddress } from '../models/PutUserAddress';
import type { PutUserBalance } from '../models/PutUserBalance';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {
  /**
   * Get User
   * @returns GetUser Successful Response
   * @throws ApiError
   */
  public static getUser(): CancelablePromise<GetUser> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/user',
    });
  }

  /**
   * Update User
   * @param requestBody
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static updateUser(
    requestBody: GetUser
  ): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/user',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete User
   * @param id
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static deleteUser(id: string): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/user',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get User Shipping Address
   * @returns GetUserAddress Successful Response
   * @throws ApiError
   */
  public static getUserShippingAddress(): CancelablePromise<GetUserAddress> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/user/shipping_address',
    });
  }

  /**
   * Update User Shipping Address
   * @param requestBody
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static updateUserShippingAddress(
    requestBody: PutUserAddress
  ): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/user/shipping_address',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get User Balance
   * @returns GetUserBalance Successful Response
   * @throws ApiError
   */
  public static getUserBalance(): CancelablePromise<GetUserBalance> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/user/balance',
    });
  }

  /**
   * Update User Balance
   * @param requestBody
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static updateUserBalance(
    requestBody: PutUserBalance
  ): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/user/balance',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Orders User
   * @param page
   * @param pageSize
   * @returns app__schemas__user__GetOrders Successful Response
   * @throws ApiError
   */
  public static getOrdersUser(
    page: number = 1,
    pageSize: number = 25
  ): CancelablePromise<app__schemas__user__GetOrders> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/user/order',
      query: {
        page: page,
        page_size: pageSize,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Detail User
   * @param id
   * @returns GetUser Successful Response
   * @throws ApiError
   */
  public static getDetailUser(id: string): CancelablePromise<GetUser> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/user/{id}',
      path: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
