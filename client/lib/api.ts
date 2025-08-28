interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "";
  }

  private async makeRequest(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<Response> {
    const {
      method = "GET",
      headers = {},
      body,
      timeout = 12000,
      retries = 2,
      signal, 
    } = options;

    const url = `${this.baseUrl}${endpoint}`;

    const requestInit: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(body && {
        body: typeof body === "string" ? body : JSON.stringify(body),
      }),
    };

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout;

      if (signal) {
        if (signal.aborted) {
          throw new Error("Request aborted by external signal");
        }
        signal.addEventListener("abort", () => {
          console.log(
            `🛑 Request aborted by external signal: ${method} ${url}`,
          );
          controller.abort("Aborted by external signal");
        });
      }

      try {
        console.log(
          `🌐 API Request (attempt ${attempt + 1}/${retries + 1}): ${method} ${url}`,
        );

        timeoutId = setTimeout(() => {
          console.warn(
            `⏰ Request timeout after ${timeout}ms: ${method} ${url}`,
          );
          controller.abort("Request timeout");
        }, timeout);

        const response = await fetch(url, {
          ...requestInit,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorText = response.statusText;
          try {
            const text = await response.text();
            if (text) {
              try {
                const parsed = JSON.parse(text);
                errorText = parsed.error || parsed.message || text;
              } catch {
                errorText = text;
              }
            }
          } catch (parseError) {
            console.warn(`⚠️ Could not read error response: ${parseError}`);
          }

          const error = new Error(`HTTP ${response.status}: ${errorText}`);
          console.error(
            `🚨 HTTP Error: ${response.status} for ${method} ${url} - ${errorText}`,
          );
          throw error;
        }

        console.log(`✅ API Request successful: ${method} ${url}`);
        return response;
      } catch (error) {
        clearTimeout(timeoutId!);

        const err = error as Error;
        console.error(
          `❌ API Request failed (attempt ${attempt + 1}): ${method} ${url} - Error: ${err.message || "Unknown error"}`,
        );

        lastError = err;

        if (err.name === "AbortError") {
          if (signal?.aborted) {
            console.log("Request was aborted by external signal, not retrying");
          } else if (err.message !== "Request timeout") {
            console.log("Request was manually aborted, not retrying");
          }
          break;
        }

        if (err.message.includes("HTTP 4")) {
          console.log("Client error (4xx), not retrying");
          break;
        }

        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    const errorMessage = this.createUserFriendlyError(lastError!, endpoint);
    throw new Error(errorMessage);
  }

  private createUserFriendlyError(error: Error, endpoint: string): string {
    console.error(`❌ API Error for ${endpoint}:`, error);

    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return "Request timed out. Please check your internet connection and try again.";
    }

    if (
      error.name === "TypeError" &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError"))
    ) {
      return "Network error. Please check your internet connection and try again.";
    }

    if (error.message.includes("HTTP 401")) {
      return "Authentication required. Please sign in again.";
    }

    if (error.message.includes("HTTP 403")) {
      return "Access denied. You don't have permission to access this resource.";
    }

    if (error.message.includes("HTTP 404")) {
      return "The requested resource was not found.";
    }

    if (error.message.includes("HTTP 429")) {
      return "Too many requests. Please wait a moment and try again.";
    }

    if (error.message.includes("HTTP 500")) {
      return "Server error. Please try again later.";
    }

    if (
      error.message.includes("HTTP 502") ||
      error.message.includes("HTTP 503")
    ) {
      return "Service temporarily unavailable. Please try again later.";
    }

    if (error.message.includes("CORS")) {
      return "Cross-origin request blocked. Please contact support if this persists.";
    }

    return error.message || "An unexpected error occurred. Please try again.";
  }

  private async parseResponse(response: Response, endpoint: string) {
    try {
      const text = await response.text();

      if (!text) {
        console.warn(`Empty response from ${endpoint}`);
        return {};
      }

      return JSON.parse(text);
    } catch (error) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, error);
      throw new Error("Invalid response format from server");
    }
  }

  async get(
    endpoint: string,
    options: Omit<ApiOptions, "method" | "body"> = {},
  ) {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: "GET",
    });
    return this.parseResponse(response, endpoint);
  }

  async post(
    endpoint: string,
    data?: any,
    options: Omit<ApiOptions, "method" | "body"> = {},
  ) {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: "POST",
      body: data,
    });
    return this.parseResponse(response, endpoint);
  }

  async put(
    endpoint: string,
    data?: any,
    options: Omit<ApiOptions, "method" | "body"> = {},
  ) {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: "PUT",
      body: data,
    });
    return this.parseResponse(response, endpoint);
  }

  async delete(
    endpoint: string,
    options: Omit<ApiOptions, "method" | "body"> = {},
  ) {
    const response = await this.makeRequest(endpoint, {
      ...options,
      method: "DELETE",
    });
    return this.parseResponse(response, endpoint);
  }

  async ping() {
    return this.get("/api/ping");
  }

  async getMoodData(email: string, days: number = 30) {
    const encodedEmail = encodeURIComponent(email);

    const url = `/api/mood/data?email=${encodedEmail}&days=${days}`;
    console.log(
      `🤖 API Client: Requesting mood data with AI insights from ${url}`,
    );
    const result = await this.get(url, { timeout: 15000 });
    console.log(`✅ API Client: Mood data with AI insights received`, result);
    return result;
  }

  async getMoodDataFast(email: string, days: number = 30) {
    const encodedEmail = encodeURIComponent(email);
    const url = `/api/mood/data/fast?email=${encodedEmail}&days=${days}`;
    console.log(`🚀 API Client: Making fast request to ${url}`);
    const result = await this.get(url);
    console.log(`🚀 API Client: Fast response received`, result);
    return result;
  }

  async addMoodEntry(data: {
    moodLevel: number;
    notes?: string;
    email: string;
    userName?: string;
  }) {
    const requestData = {
      ...data,
      generateInsights: true,
    };
    console.log("🤖 API Client: Adding mood entry with AI insight generation");
    return this.post("/api/mood/entries", requestData);
  }

  async createJournalEntry(data: {
    content: string;
    mood?: number;
    email: string;
    userName?: string;
    tags?: string[];
  }) {
    const requestData = {
      ...data,
      generateAIResponse: true,
    };
    console.log(
      "🤖 API Client: Creating journal entry with AI response generation",
    );
    return this.post("/api/journal/entries", requestData);
  }

  async getJournalEntries(email: string, page: number = 1, limit: number = 10) {
    const encodedEmail = encodeURIComponent(email);
    return this.get(
      `/api/journal/entries?email=${encodedEmail}&page=${page}&limit=${limit}`,
    );
  }

  async getUserProfile(email: string) {
    const encodedEmail = encodeURIComponent(email);
    return this.get(`/api/user/profile?email=${encodedEmail}`);
  }

  async updateUserProfile(data: {
    email: string;
    username?: string;
    bio?: string;
  }) {
    return this.put("/api/user/profile", data);
  }
}

export const apiClient = new ApiClient();

export default apiClient;
