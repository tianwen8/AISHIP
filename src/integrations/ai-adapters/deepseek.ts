/**
 * DeepSeek API Adapter Implementation
 * LLM adapter using DeepSeek's OpenAI-compatible API
 */

import type { ILLMAdapter, LLMRequest, LLMResponse } from "./types"

export class DeepSeekLLMAdapter implements ILLMAdapter {
  private apiKey: string
  private baseUrl = "https://openrouter.ai/api/v1"

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ""
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured")
    }
  }

  async call(request: LLMRequest): Promise<LLMResponse> {
    try {
      const messages: any[] = []

      if (request.systemPrompt) {
        messages.push({
          role: "system",
          content: request.systemPrompt,
        })
      }

      messages.push({
        role: "user",
        content: request.prompt,
      })

      const requestBody: any = {
        model: request.model || "deepseek/deepseek-chat-v3.1",
        messages,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 2000,
      }

      // DeepSeek 支持 JSON 模式
      if (request.responseFormat === "json") {
        requestBody.response_format = { type: "json_object" }
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Optional headers for OpenRouter analytics/attribution.
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Cineprompt",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `DeepSeek API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        )
      }

      const data = await response.json()

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from DeepSeek API")
      }

      const content = data.choices[0].message?.content || ""

      return {
        output: content,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        metadata: data,
      }
    } catch (error: any) {
      console.error("DeepSeekLLMAdapter error:", error)
      throw new Error(`DeepSeek LLM call failed: ${error.message}`)
    }
  }
}
