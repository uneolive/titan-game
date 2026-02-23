interface ExternalLogger {
  log(level: string, message: string, context?: Record<string, unknown>): void;
}

class Logger {
  private static externalLoggers: ExternalLogger[] = [];

  static addExternalLogger(logger: ExternalLogger) {
    this.externalLoggers.push(logger);
  }

  static info(message: string, context?: Record<string, unknown>) {
    const enrichedContext = this.enrichContext(context);
    console.log(`[INFO] ${message}`, enrichedContext);
    this.sendToExternalLoggers('info', message, enrichedContext);
  }

  static warn(message: string, context?: Record<string, unknown>) {
    const enrichedContext = this.enrichContext(context);
    console.warn(`[WARN] ${message}`, enrichedContext);
    this.sendToExternalLoggers('warn', message, enrichedContext);
  }

  static error(message: string, context?: Record<string, unknown>) {
    const enrichedContext = this.enrichContext(context);
    console.error(`[ERROR] ${message}`, enrichedContext);
    this.sendToExternalLoggers('error', message, enrichedContext);
  }

  static debug(message: string, context?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      const enrichedContext = this.enrichContext(context);
      console.debug(`[DEBUG] ${message}`, enrichedContext);
      this.sendToExternalLoggers('debug', message, enrichedContext);
    }
  }

  private static enrichContext(context?: Record<string, unknown>): Record<string, unknown> {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
  }

  private static sendToExternalLoggers(
    level: string,
    message: string,
    context?: Record<string, unknown>
  ) {
    this.externalLoggers.forEach((logger) => {
      try {
        logger.log(level, message, context);
      } catch (error) {
        console.error('Failed to send log to external logger:', error);
      }
    });
  }
}

export default Logger;
