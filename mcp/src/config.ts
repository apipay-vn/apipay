import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export interface Config {
  baseUrl: string;
  accessKey?: string;
  secretKey?: string;
}

export function normalizeBaseUrl(url: string): string {
  const cleanUrl = url.replace(/\/+$/, "");
  if (/\/v[12]$/.test(cleanUrl)) {
    return cleanUrl.replace(/\/v[12]$/, "/v1");
  }
  return `${cleanUrl}/v1`;
}

export function getDefaultConfigFilePath(): string {
  return path.join(os.homedir(), ".config", "apipay", "config.json");
}

export function readCliConfigFile(filePath?: string): { accessKey?: string; secretKey?: string } {
  try {
    const file = filePath ?? getDefaultConfigFilePath();
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      const parsed = JSON.parse(content);
      if (parsed?.apiKey?.accessKey && parsed?.apiKey?.secretKey) {
        return {
          accessKey: parsed.apiKey.accessKey,
          secretKey: parsed.apiKey.secretKey,
        };
      }
    }
  } catch {
    // missing/corrupt CLI config must not prevent startup
  }
  return {};
}

export function loadConfig(env = process.env, customConfigPath?: string): Config {
  const rawBaseUrl = env.APIPAY_API_URL || "https://app.apipay.vn/v1";
  const baseUrl = normalizeBaseUrl(rawBaseUrl);

  let accessKey = env.APIPAY_ACCESS_KEY;
  let secretKey = env.APIPAY_SECRET_KEY;

  if (!accessKey || !secretKey) {
    const cliKey = readCliConfigFile(customConfigPath);
    accessKey = accessKey || cliKey.accessKey;
    secretKey = secretKey || cliKey.secretKey;
  }

  return {
    baseUrl,
    accessKey: accessKey || undefined,
    secretKey: secretKey || undefined,
  };
}
