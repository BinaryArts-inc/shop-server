# Log Service Documentation

## Overview

The Log Service provides a unified logging interface supporting multiple drivers such as **Slack** and **Sentry**. It is designed to:

* Capture logs at various levels (`info`, `debug`, `warn`, `error`, `fatal`, etc.)
* Route logs to one or more configured channels dynamically
* Support extensible drivers via a strategy pattern

## Configuration

Logging channels are configured via a centralized configuration object, where each channel specifies:

* `driver`: The logging backend (`"slack"` or `"sentry"`)
* Driver-specific options (e.g., webhook URLs for Slack, DSN keys for Sentry)
* Minimum log `level` to control verbosity

Example configuration snippet:

```ts
channels: {
  debuglog: {
    driver: "slack",
    url: "https://hooks.slack.com/services/...",
    username: "DebugLogger",
    level: "debug"
  },
  mainlog: {
    driver: "sentry",
    publicKey: "...",
    secretKey: "...",
    level: "error"
  }
},
defaultChannel: "mainlog"
```

## Usage

* Use the injected `LogService` to log messages at the desired level.
* You can select specific channels or rely on the default channel.
* Example:

```ts
this.logService.error({
  message: "Something went wrong",
  method: "POST",
  path: "/api/user",
  status: 500,
  userId: "1234",
  stackTrace: "...",
  cause: "Database error",
  timeStamp: new Date().toISOString(),
  level: "error"
});
```

## Log Levels

Supported log levels include:
`info`, `debug`, `warn`, `error`, `fatal`, `verbose`

Channels can be configured to filter logs below a certain level.

---

## Important: Sentry SDK Limitation

The Sentry SDK currently supports **only one Sentry instance (DSN) per Node.js process**.

* Although this Log Service configuration supports multiple channels, defining multiple **Sentry** channels with different DSNs **in the same process will not work as expected**.
* The SDK uses a global singleton client internally and does **not support multiple independent clients in one app process**.
* To support multiple Sentry DSNs, consider:

  * Running **separate Node.js processes or microservices**, each configured with its own DSN.
  * Using a single DSN and differentiating logs with tags or contexts.
  * Implementing an external logging proxy or queue service to route logs accordingly.

Please ensure your deployment and configuration strategy aligns with this limitation to avoid unexpected logging behavior.

---

## Extensibility

* You can add new logging drivers by implementing the `ILogService` interface and registering them in the module.
* The LogService uses a strategy pattern to dynamically route logs to the appropriate driver.

---

## Summary

The Log Service offers flexible, multi-driver logging for your NestJS backend, with built-in support for Slack and Sentry.
Keep in mind the Sentry SDK’s singleton limitation when designing multi-project logging architectures.
