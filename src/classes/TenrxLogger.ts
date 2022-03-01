import { ISettingsParam, TLogLevelName, Logger, ISettings, ILogObject, TTransportLogger, TLogLevelColor } from 'tslog';
import TenrxNotInitialized from '../exceptions/TenrxNotInitialized.js';
import { isBrowser } from '../includes/TenrxFunctions.js';
import { TenrxLibraryLogger } from '../includes/TenrxLogging.js';

/**
 * Represents a TenrxLogger class. It supports both browser and node.
 *
 * @export
 * @class TenrxLogger
 */
export default class TenrxLogger {
  private readonly logLevels: TLogLevelName[] = ['silly', 'trace', 'debug', 'info', 'warn', 'error', 'fatal'];

  private internalLogger: Logger | null;
  private internalSettings: ISettingsParam;

  private static _instance: TenrxLogger | null = null;

  public noConsole = true;

  /**
   * Creates an instance of TenrxLogger.
   *
   * @param {ISettingsParam} [settings]
   * @memberof TenrxLogger
   */
  public constructor(settings?: ISettingsParam) {
    this.internalSettings = settings
      ? settings
      : {
          name: 'TenrxLoggerNoName',
          minLevel: 'warn',
          type: 'hidden',
          maskValuesOfKeys: ['access_token', 'authorization', 'password', 'Authorization'],
          maskPlaceholder: '********',
        };
    this.internalLogger = isBrowser ? null : new Logger({ ignoreStackLevels: 4, ...this.internalSettings });
  }

  /**
   * Returns true if it is a console logger. Otherwise, it returns false.
   *
   * @return {*}  {boolean}
   * @memberof TenrxLogger
   */
  public isItConsoleLogger(): boolean {
    return this.internalLogger == null;
  }

  /**
   * Gets the settings of the logger. If it is a console logger, then it will not return anything.
   *
   * @readonly
   * @type {(ISettings)}
   * @memberof TenrxLogger
   */
  public get settings(): ISettings {
    if (this.internalLogger) {
      return this.internalLogger.settings;
    } else {
      const intSettings: ISettings = {
        minLevel: this.internalSettings.minLevel ? this.internalSettings.minLevel : 'warn',
        type: 'hidden',
        setCallerAsLoggerName: false,
        exposeStack: false,
        exposeErrorCodeFrame: false,
        exposeErrorCodeFrameLinesBeforeAndAfter: 0,
        ignoreStackLevels: 0,
        suppressStdOutput: false,
        overwriteConsole: false,
        logLevelsColors: 0 as unknown as TLogLevelColor,
        colorizePrettyLogs: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        prettyInspectHighlightStyles: 0 as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        prettyInspectOptions: 0 as any,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        jsonInspectOptions: 0 as any,
        delimiter: '',
        prefix: [],
        maskValuesOfKeys: [],
        maskAnyRegEx: [],
        maskPlaceholder: '',
        printLogMessageInNewLine: false,
        displayDateTime: false,
        displayLogLevel: false,
        displayInstanceName: false,
        displayRequestId: false,
        displayFilePath: 'hidden',
        displayFunctionName: false,
        displayTypes: false,
        stdOut: {
          write: (message: string) => {
            return message;
          },
        },
        stdErr: {
          write: (message: string) => {
            return message;
          },
        },
        attachedTransports: [],
      };
      return intSettings;
    }
  }

  /**
   * Change settings during runtime
   * Changes will be propagated to potential child loggers
   *
   * @param settings - Settings to overwrite with. Only this settings will be overwritten, rest will remain the same.
   * @param parentSettings - INTERNAL USE: Is called by a parent logger to propagate new settings.
   */
  public setSettings(settings: ISettingsParam, parentSettings?: ISettings): ISettings | void {
    if (this.internalLogger) {
      this.internalLogger.setSettings(settings, parentSettings);
      return this.internalLogger.settings;
    }
  }

  /**
   * Attaches external Loggers, e.g. external log services, file system, database
   *
   * @param transportLogger - External logger to be attached. Must implement all log methods.
   * @param minLevel        - Minimum log level to be forwarded to this attached transport logger. (e.g. debug)
   */
  public attachTransport(
    transportLogger: TTransportLogger<(message: ILogObject) => void>,
    minLevel: TLogLevelName = 'silly',
  ): void {
    if (this.internalLogger) {
      this.internalLogger.attachTransport(transportLogger, minLevel);
    }
  }

  /**
   * Logs a silly message.
   *
   * @param {...unknown[]} args
   * @return {*}  {ILogObject}
   * @memberof TenrxLogger
   */
  public silly(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      this.internalLogger.silly(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('silly') >= this.logLevels.indexOf(this.settings.minLevel)) console.log(...args);
      }
    }
  }

  /**
   * Logs a trace message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public trace(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.trace(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('trace') >= this.logLevels.indexOf(this.settings.minLevel)) console.log(...args);
      }
    }
  }

  /**
   * Logs a debug message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public debug(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.debug(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('debug') >= this.logLevels.indexOf(this.settings.minLevel)) console.debug(...args);
      }
    }
  }

  /**
   * Logs an info message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public info(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.info(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('info') >= this.logLevels.indexOf(this.settings.minLevel)) console.info(...args);
      }
    }
  }

  /**
   * Logs a warn message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public warn(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.warn(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('warn') >= this.logLevels.indexOf(this.settings.minLevel)) console.warn(...args);
      }
    }
  }

  /**
   * Logs an error message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public error(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.error(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('error') >= this.logLevels.indexOf(this.settings.minLevel)) console.error(...args);
      }
    }
  }

  /**
   * Logs a fatal message.
   *
   * @param args  - Multiple log attributes that should be logged out.
   */
  public fatal(...args: unknown[]): ILogObject | void {
    if (this.internalLogger) {
      return this.internalLogger.fatal(...args);
    } else {
      if (!this.noConsole) {
        // Need to do this because of the way for the linter to not complain.
        // eslint-disable-next-line no-console
        if (this.logLevels.indexOf('fatal') >= this.logLevels.indexOf(this.settings.minLevel)) console.error(...args);
      }
    }
  }

  /**
   * Returns the singleton instance of the TenrxLogger.
   *
   * @readonly
   * @static
   * @type {TenrxLogger}
   * @memberof TenrxLogger
   */
  public static get instance(): TenrxLogger {
    // This is needed since the actual instance is stored in the _instance static variable
    // eslint-disable-next-line no-underscore-dangle
    if (TenrxLogger._instance === null) {
      TenrxLibraryLogger.error('TenrxLogger is not initialized. Call TenrxLogger.Initialize() first.');
      throw new TenrxNotInitialized(
        'TenrxLogger is not initialized. Call TenrxLogger.Initialize() first.',
        'TenrxLogger',
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    return TenrxLogger._instance;
  }

  /**
   * Initializes the singleton instance of TenrxLogger.
   *
   * @static
   * @param {string} businesstoken
   * @param {string} baseapi
   * @memberof TenrxLogger
   */
  public static initialize(settings: ISettingsParam): void {
    // eslint-disable-next-line no-underscore-dangle
    if (TenrxLogger._instance !== null) {
      TenrxLibraryLogger.warn('TenrxLogger is already initialized. Call TenrxLogger.Initialize() only once.');
    }
    // eslint-disable-next-line no-underscore-dangle
    TenrxLogger._instance = new TenrxLogger(settings);
  }

  /**
   * Returns true if the singleton instance is initialized. Otherwise false.
   *
   * @static
   * @return {*}  {boolean}
   * @memberof TenrxLogger
   */
  public static isInstanceInitialized(): boolean {
    // eslint-disable-next-line no-underscore-dangle
    return TenrxLogger._instance !== null;
  }
}
