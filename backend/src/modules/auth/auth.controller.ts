import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    // #region agent log
    fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': 'b8fd10',
      },
      body: JSON.stringify({
        sessionId: 'b8fd10',
        runId: 'initial',
        hypothesisId: 'H1',
        location: 'src/modules/auth/auth.controller.ts:login',
        message: 'AuthController.login called',
        data: {
          hasEmail: !!dto?.email,
          emailLength: dto?.email ? dto.email.length : 0,
          hasPassword: !!dto?.password,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log

    try {
      const result = await this.authService.login(dto.email, dto.password);

      // #region agent log
      fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'b8fd10',
        },
        body: JSON.stringify({
          sessionId: 'b8fd10',
          runId: 'initial',
          hypothesisId: 'H2',
          location: 'src/modules/auth/auth.controller.ts:login',
          message: 'AuthController.login succeeded',
          data: {
            hasResult: !!result,
            hasAccessToken: !!(result as any)?.accessToken,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      return result;
    } catch (error) {
      const err: any = error;
      console.error('[auth/login] 500 error:', err?.name, err?.message, err?.stack);

      // #region agent log
      fetch('http://127.0.0.1:7885/ingest/231ef9cf-d927-49db-82f0-f19e114f6243', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Session-Id': 'b8fd10',
        },
        body: JSON.stringify({
          sessionId: 'b8fd10',
          runId: 'initial',
          hypothesisId: 'H3',
          location: 'src/modules/auth/auth.controller.ts:login',
          message: 'AuthController.login error',
          data: {
            errorName: err?.name,
            errorMessage: err?.message,
            status: typeof err?.getStatus === 'function' ? err.getStatus() : undefined,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion agent log

      throw error;
    }
  }

  @Post('logout')
  async logout() {
    return this.authService.loogout();
  }
}
