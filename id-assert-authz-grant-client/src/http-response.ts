export default class HttpResponse {
  url: string;

  status: number;

  statusText: string;

  body?: string;

  constructor(url: string, status: number, statusText: string, body?: string) {
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}
