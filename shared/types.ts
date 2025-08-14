// Shared types between frontend and backend

export interface TemplateRequest {
  templateType: 'basic-wifi' | 'enterprise-wifi' | 'guest-network';
  organizationName: string;
  siteName: string;
  networkName: string;
  ssid: string;
  securityType: string;
  vlanId?: string;
  bandwidth?: string;
  deviceType: string;
}

export interface APIConfigRequest {
  apiEndpoint: string;
  apiKey: string;
  organizationId: string;
  siteId: string;
  authMethod: 'api-key' | 'oauth';
  format: 'curl' | 'python' | 'javascript' | 'postman';
}

export interface ConfigResponse {
  success: boolean;
  config: string;
  format: string;
  error?: string;
}

export interface ValidationResponse {
  valid: boolean;
  errors: string[];
}

export interface RuckusOneConfig {
  name: string;
  ssid: string;
  security?: {
    type: string;
    encryption?: string;
    passphrase?: string;
  };
  vlan?: {
    id: number;
    isolation?: boolean;
  };
  bandwidth?: {
    limit: string;
    per_client_limit?: string;
  };
}
