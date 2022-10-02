import { ConnectionTransport } from 'puppeteer-core';
import NodeWebSocket from 'ws';

export class JustBrowseTransport implements ConnectionTransport {
  static create(url: string, requestId: string): Promise<JustBrowseTransport> {
    return new Promise((resolve, reject) => {
      const ws = new NodeWebSocket(url, [], {
        followRedirects: true,
        perMessageDeflate: false,
        maxPayload: 256 * 1024 * 1024, // 256Mb
        headers: {
          'User-Agent': `JustBrowse`,
          'X-Request-Id': requestId,
        },
      });

      ws.addEventListener('open', () => {
        return resolve(new JustBrowseTransport(ws));
      });
      ws.addEventListener('error', reject);
    });
  }

  #ws: NodeWebSocket;
  onmessage?: (message: NodeWebSocket.Data) => void;
  onclose?: () => void;

  constructor(ws: NodeWebSocket) {
    this.#ws = ws;
    this.#ws.addEventListener('message', (event) => {
      if (this.onmessage) {
        this.onmessage.call(null, event.data);
      }
    });
    this.#ws.addEventListener('close', () => {
      if (this.onclose) {
        this.onclose.call(null);
      }
    });

    this.#ws.addEventListener('error', () => {});
  }

  send(message: string): void {
    this.#ws.send(message);
  }

  close(): void {
    this.#ws.close();
  }
}
