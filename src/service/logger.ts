import winston, { type LoggerOptions } from 'winston';

class Logger {
  private logger?: winston.Logger;
  private enableLogging: boolean;
  constructor(enableLogging: boolean, options?: LoggerOptions) {
    this.enableLogging = enableLogging;
    if (enableLogging) {
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json()
        ),
        transports: [
          new winston.transports.File({
            filename: 'error.log',
            level: 'error',
          }),
          new winston.transports.File({ filename: 'combined.log' }),
          new winston.transports.Console({
            format: winston.format.simple(),
          }),
        ],
      });
    }
  }

  public log(message: string): void {
    if (this.enableLogging) {
      this?.logger?.info(message);
    }
  }

  public error(message: string, emit?: any): void {
    if (emit) {
      emit('error', { message });
    }
    if (this.enableLogging) {
      this?.logger?.error(message);
    }
  }

  public warn(message: string): void {
    if (this.enableLogging) {
      this?.logger?.warn(message);
    }
  }
}

export default Logger;
