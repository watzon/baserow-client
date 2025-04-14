import chalk from 'chalk';

/**
 * Log a success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Log an error message
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * Log a warning message
 */
export function warning(message: string): void {
  console.warn(chalk.yellow('⚠'), message);
}

/**
 * Log an info message
 */
export function info(message: string): void {
  console.info(chalk.blue('ℹ'), message);
}

/**
 * Log a debug message (only when verbose mode is enabled)
 */
export function debug(message: string): void {
  if (process.env.DEBUG) {
    console.debug(chalk.gray('��'), message);
  }
} 