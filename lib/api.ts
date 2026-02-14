"use client"

import { getApiKey } from "./store"

export async function apiFetch(
  url: string,
  body: Record<string, unknown>
): Promise<Response> {
  const apiKey = getApiKey()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (apiKey) {
    headers["x-openai-key"] = apiKey
  }
  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
}
