import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from "@nestjs/common"

import { LogService } from "@/modules/services/log/log.service"
import { ErrorContext } from "@/modules/services/log/interfaces/log.interface"

@Catch()
export class GlobalExceptionFilters implements ExceptionFilter {
  constructor(private readonly logService: LogService) {}

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const context: ErrorContext = {
      userId: "unauthenticated",
      level: "error",
      status: 500,
      path: request.url,
      method: request.method,
      message: "internal server error",
      timeStamp: new Date().toISOString(),
      stackTrace: exception.stack,
      cause: String(exception)
    }

    if (exception instanceof NotFoundException) {
      context.status = exception.getStatus()
      context.message = `route not found`
      console.error(context)
    } else if (exception instanceof HttpException) {
      context.status = exception.getStatus()
      context.message = exception.message
      this.logService.debug(context)
      console.error(context)
    } else {
      console.error(context)
      this.logService.debug(context)
      this.logService.error(context)
    }

    // send response
    response.status(context.status).json({
      success: false,
      message: context.message
    })
  }
}
