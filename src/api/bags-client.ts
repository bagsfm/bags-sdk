import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { BagsApiResponse } from '../types/api';
import { BAGS_PUBLIC_API_V2_DEFAULT_BASE_URL } from '../constants';

export class BagsApiClient {
	private client: AxiosInstance;

	constructor(apiKey: string, baseUrl: string = BAGS_PUBLIC_API_V2_DEFAULT_BASE_URL, options: Partial<AxiosRequestConfig> = {}) {
		this.client = createBagsAxiosInstance(baseUrl, apiKey, options);
	}

	private async handleResponse<T>(responsePromise: Promise<AxiosResponse<BagsApiResponse<T>>>): Promise<T> {
		const response = await responsePromise;
		const { data } = response;

		if (data.success == true) {
			return data.response;
		} else {
			throw new ApiError(data.error, response.config, response.status, data);
		}
	}

	async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.handleResponse(this.client.get<BagsApiResponse<T>>(url, config));
	}

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return this.handleResponse(this.client.post<BagsApiResponse<T>>(url, data, config));
	}

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return this.handleResponse(this.client.put<BagsApiResponse<T>>(url, data, config));
	}

	async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return this.handleResponse(this.client.delete<BagsApiResponse<T>>(url, config));
	}
}

export class ApiError extends Error {
	public url: string;
	public method?: string;
	public status?: number;
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	public data?: any;

	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	constructor(message: string, config: AxiosRequestConfig, status?: number, data?: any) {
		super(message);
		this.name = 'ApiError';
		this.url = config.url || 'unknown URL';
		this.method = config.method?.toUpperCase();
		this.status = status;
		this.data = data;
	}
}

export function createBagsAxiosInstance(baseUrl: string, apiKey: string, additionalAxiosConfig: Partial<AxiosRequestConfig> = {}): AxiosInstance {
	const axiosInstance = axios.create({
		baseURL: baseUrl,
		timeout: 60_000,
		...additionalAxiosConfig,
	});

	axiosInstance.interceptors.request.use(
		(config) => {
			config.headers['x-api-key'] = apiKey;
			return config;
		},
		(error) => Promise.reject(new ApiError('Request configuration error', error.config || {}, undefined, error))
	);

	axiosInstance.interceptors.response.use(
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
		(res: AxiosResponse<BagsApiResponse<any>>) => {
			return res;
		},
		(err: AxiosError) => {
			const cfg: AxiosRequestConfig = err.config ?? { url: undefined, method: undefined };

			let msg = 'An unexpected error occurred';
			let status: number | undefined;
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			let payload: any;

			if (err.response) {
				status = err.response.status;
				const d = err.response.data;
				payload = d;

				if (d && typeof d === 'object' && 'success' in d && d.success === false && 'error' in d) {
					msg = d.error as string;
				} else if (d && typeof d === 'object' && 'message' in d) {
					msg = d.message as string;
				} else if (status) {
					msg = `Request failed with status ${status}`;
				}
			} else if (err.request) {
				msg = 'No response received from server';
			} else {
				msg = err.message;
			}

			const apiErr = new ApiError(msg, cfg, status, payload);
			return Promise.reject(apiErr);
		}
	);

	return axiosInstance;
}
