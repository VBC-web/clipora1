declare module 'archiver' {
  import type { Writable } from 'node:stream';

  export class ZipArchive {
    constructor(options?: { store?: boolean });
    pipe(destination: Writable): Writable;
    file(path: string, data: { name: string }): this;
    finalize(): Promise<void>;
    once(event: 'error', listener: (error: Error) => void): this;
  }
}