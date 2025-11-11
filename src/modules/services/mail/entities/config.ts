/**
 * Injection token used to provide and retrieve mail configuration options
 * from NestJS's dependency injection system.
 *
 * This allows the Mail module (or any other consumer) to inject configuration
 * values without relying on hard-coded imports.
 */
export const CONFIG_OPTIONS = "MAIL_CONFIG_OPTIONS"
