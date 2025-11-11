import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { map, Observable } from "rxjs"
import { SettingResponseMapper } from "../interface/setting-response-mapper.interface"
import { Setting } from "../entities/setting.entity"
import { ISettingResponse } from "../interface/settings-response.interface"

@Injectable()
export class SettingInterceptor extends SettingResponseMapper implements NestInterceptor<Setting, ISettingResponse> {
  intercept(__context: ExecutionContext, next: CallHandler<Setting>): Observable<ISettingResponse> | Promise<Observable<ISettingResponse>> {
    return next.handle().pipe(map((data) => this.transform(data)))
  }
}
