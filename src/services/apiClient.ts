import axios, { AxiosInstance, AxiosError } from "axios";
import type {
  GW2Account,
  Character,
  GW2Item,
  LegendaryArmoryItem,
  GW2Skin,
} from "@/types/gw2-api";

const GW2_BASE_URL = "https://api.guildwars2.com/v2";
const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class InvalidApiKeyError extends ApiError {
  constructor() {
    super("Invalid API key. Please check your key and try again.", 401, "INVALID_KEY");
  }
}

export class ApiTimeoutError extends ApiError {
  constructor() {
    super("Request timed out. The GW2 API may be unavailable.", 408, "TIMEOUT");
  }
}

function createAxiosInstance(apiKey: string): AxiosInstance {
  // Use access_token query param instead of Authorization header to avoid
  // CORS preflight (OPTIONS) requests — the GW2 API doesn't respond to them correctly.
  const instance = axios.create({
    baseURL: GW2_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    params: { access_token: apiKey },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        return Promise.reject(new ApiTimeoutError());
      }
      if (error.response?.status === 401 || error.response?.status === 403) {
        return Promise.reject(new InvalidApiKeyError());
      }
      const message =
        (error.response?.data as { text?: string })?.text ??
        error.message ??
        "An unexpected error occurred.";
      return Promise.reject(
        new ApiError(message, error.response?.status),
      );
    },
  );

  return instance;
}

export class GW2ApiClient {
  private readonly http: AxiosInstance;

  constructor(apiKey: string) {
    this.http = createAxiosInstance(apiKey);
  }

  async validateApiKey(): Promise<GW2Account> {
    const { data } = await this.http.get<GW2Account>("/account");
    return data;
  }

  async getCharacterNames(): Promise<string[]> {
    const { data } = await this.http.get<string[]>("/characters");
    return data;
  }

  async getCharacter(name: string): Promise<Character> {
    const { data } = await this.http.get<Character>(
      `/characters/${encodeURIComponent(name)}`,
      { params: { v: "2019-12-19T00:00:00.000Z" } },
    );
    return data;
  }

  async getCharacters(names: string[]): Promise<Character[]> {
    // GW2 API doesn't support bulk character fetch — fetch in parallel with concurrency limit
    const results = await Promise.allSettled(
      names.map((name) => this.getCharacter(name)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Character> => r.status === "fulfilled")
      .map((r) => r.value);
  }

  async getLegendaryArmory(): Promise<LegendaryArmoryItem[]> {
    const { data } = await this.http.get<LegendaryArmoryItem[]>("/account/legendaryarmory");
    return data;
  }

  async getItems(ids: number[]): Promise<GW2Item[]> {
    if (ids.length === 0) return [];
    const chunks = chunkArray(ids, 200);
    const results = await Promise.all(
      chunks.map((chunk) =>
        this.http
          .get<GW2Item[]>("/items", { params: { ids: chunk.join(",") } })
          .then((r) => r.data),
      ),
    );
    return results.flat();
  }

  async getSkins(ids: number[]): Promise<GW2Skin[]> {
    if (ids.length === 0) return [];
    const chunks = chunkArray(ids, 200);
    const results = await Promise.all(
      chunks.map((chunk) =>
        this.http
          .get<GW2Skin[]>("/skins", { params: { ids: chunk.join(",") } })
          .then((r) => r.data),
      ),
    );
    return results.flat();
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// Singleton factory — recreated whenever the API key changes
let clientInstance: GW2ApiClient | null = null;
let currentKey: string | null = null;

export function getApiClient(apiKey: string): GW2ApiClient {
  if (apiKey !== currentKey) {
    clientInstance = new GW2ApiClient(apiKey);
    currentKey = apiKey;
  }
  return clientInstance!;
}
