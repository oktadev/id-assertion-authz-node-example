export interface BedrockClientConfig {
  region?: string;
  modelId?: string;
}

export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ToolCall {
  serverName: string;
  toolName: string;
  arguments: any;
  result?: any;
  error?: string;
}

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface ConversationContext {
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  connectedServers: string[];
}
