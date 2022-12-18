/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCategory } from '../models/CreateCategory';
import type { DefaultResponse } from '../models/DefaultResponse';
import type { DetailCategory } from '../models/DetailCategory';
import type { GetCategory } from '../models/GetCategory';
import type { UpdateCategory } from '../models/UpdateCategory';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CategoryService {
  /**
   * Get Category
   * @returns GetCategory Successful Response
   * @throws ApiError
   */
  public static getCategory(): CancelablePromise<GetCategory> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/categories',
    });
  }

  /**
   * Update Category
   * @param id
   * @param requestBody
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static updateCategory(
    id: string,
    requestBody: UpdateCategory
  ): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/categories',
      query: {
        id: id,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Category
   * @param requestBody
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static createCategory(
    requestBody: CreateCategory
  ): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/categories',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Category
   * @param id
   * @returns DefaultResponse Successful Response
   * @throws ApiError
   */
  public static deleteCategory(id: string): CancelablePromise<DefaultResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/categories',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Detail Category
   * @param id
   * @returns DetailCategory Successful Response
   * @throws ApiError
   */
  public static getDetailCategory(
    id: string
  ): CancelablePromise<DetailCategory> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/categories/detail',
      query: {
        id: id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
