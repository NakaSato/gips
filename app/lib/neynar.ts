import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

let neynarClient: NeynarAPIClient | null = null;

// Lazily construct the client so importing this module never throws at
// build/module-eval time when NEYNAR_API_KEY is absent. The error surfaces
// only when a request actually needs Neynar (graceful degradation).
export default function getNeynarClient(): NeynarAPIClient {
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }
  if (!neynarClient) {
    neynarClient = new NeynarAPIClient(
      new Configuration({ apiKey: process.env.NEYNAR_API_KEY })
    );
  }
  return neynarClient;
}
