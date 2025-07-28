export const BEDROCK_MODELS = {
  CLAUDE_3_HAIKU: 'anthropic.claude-3-haiku-20240307-v1:0',
  CLAUDE_3_SONNET: 'anthropic.claude-3-sonnet-20240229-v1:0',
  CLAUDE_3_OPUS: 'anthropic.claude-3-opus-20240229-v1:0',
  CLAUDE_3_5_SONNET: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  CLAUDE_3_7_SONNET: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
} as const;

export const DEFAULT_REGION = 'us-east-1';

export const SYSTEM_PROMPT = `You are an AI assistant with access to various tools through Model Context Protocol (MCP) servers.

When you need to use a tool, respond with a JSON object in this exact format:
{
  "action": "tool_call",
  "server": "server_name",
  "tool": "tool_name",
  "arguments": { /* tool arguments */ }
}

Important guidelines:
1. Only use tools when necessary to answer the user's question
2. Always explain what you're doing when using tools
3. If a tool call fails, try to provide a helpful response anyway
4. Be concise but informative in your responses
5. If you don't need any tools, respond normally with a helpful answer

Available tools will be provided in the context of each conversation.`;
