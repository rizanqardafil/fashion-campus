/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetBestSeller } from '../models/GetBestSeller';
import type { GetCategories } from '../models/GetCategories';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HomeService {
  /**
   * Get Category With Image
   * @returns GetCategories Successful Response
   * @throws ApiError
   */
  public static getCategoryWithImage(): CancelablePromise<GetCategories> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/home/category',
    });
  }

  /**
   * Get Best Seller
   * @returns GetBestSeller Successful Response
   * @throws ApiError
   */
  public static getBestSeller(): CancelablePromise<GetBestSeller> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/home/best-seller',
    });
  }
}
