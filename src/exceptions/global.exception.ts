// import { LogService } from "src/modules/services/log/log.service"
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, NotFoundException } from "@nestjs/common"

@Catch()
export class GlobalExceptionFilters implements ExceptionFilter {
  // constructor(private readonly logService: LogService) {}
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const context = {
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
      console.log("sup", context)
    } else if (exception instanceof HttpException) {
      context.status = exception.getStatus()
      context.message = exception.message
      // this.logService.log(exception.message, context)
      console.log(context)
    } else {
      console.log(context)
      // this.logService.channel("debuglog").debug(String(exception), context)
    }

    // send response
    response.status(context.status).json({
      success: false,
      message: context.message
    })
  }
}
