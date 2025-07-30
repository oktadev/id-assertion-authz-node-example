export class Logger {
  private static instance: Logger;

  private debugMode: boolean;

  private constructor() {
    this.debugMode = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any): void {
    const errorData =
      error instanceof Error ? { message: error.message, stack: error.stack } : error;
    console.error(this.formatMessage('error', message, errorData));
  }

  debug(message: string, data?: any): void {
    if (this.debugMode) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  success(message: string, data?: any): void {
    console.log(`✅ ${message}${data ? `\n${JSON.stringify(data, null, 2)}` : ''}`);
  }

  loading(message: string): void {
    console.log(`⏳ ${message}`);
  }

  mcpEvent(serverName: string, event: string, data?: any): void {
    this.debug(`MCP[${serverName}] ${event}`, data);
  }

  toolCall(serverName: string, toolName: string, args?: any): void {
    this.info(`🔧 Calling tool: ${toolName} on server: ${serverName}`, args);
  }

  toolResult(serverName: string, toolName: string, result: any): void {
    this.debug(`🔧 Tool result: ${toolName} on server: ${serverName}`, result);
  }
}

export const logger = Logger.getInstance();
