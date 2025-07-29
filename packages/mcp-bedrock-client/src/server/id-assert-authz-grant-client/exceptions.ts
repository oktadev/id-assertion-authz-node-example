export class InvalidArgumentError extends Error {
  constructor(argument: string, message?: string) {
    super(`Invalid argument ${argument}.${message ? ` ${message}` : ''}`);
    this.name = this.constructor.name;
  }
}

export class InvalidPayloadError extends Error {
  data?: Record<string, any>;

  constructor(message: string, data?: Record<string, any>) {
    super(`Invalid payload. ${message}`);
    this.name = this.constructor.name;
    if (data && typeof data === 'object') {
      this.data = data;
    }
  }
}
