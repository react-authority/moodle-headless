/**
 * Moodle Client using moodle-ts package
 * 
 * This module exports a configured MoodleClient instance and typed API wrappers.
 * For full type safety, use the versioned imports from moodle-ts/moodle/MOODLE_405_STABLE
 */

import { MoodleClient } from "moodle-ts";

const MOODLE_URL = process.env.MOODLE_URL || "";
const MOODLE_TOKEN = process.env.MOODLE_TOKEN || "";

// Singleton client instance
let clientInstance: MoodleClient | null = null;

export function getClient(): MoodleClient {
  if (!clientInstance) {
    clientInstance = new MoodleClient({
      baseUrl: MOODLE_URL,
      token: MOODLE_TOKEN,
    });
  }
  return clientInstance;
}

export function isConfigured(): boolean {
  return Boolean(MOODLE_URL && MOODLE_TOKEN);
}

export function getMoodleUrl(): string {
  return MOODLE_URL;
}

export function getMoodleToken(): string {
  return MOODLE_TOKEN;
}

// Re-export the client class for type usage
export { MoodleClient };
