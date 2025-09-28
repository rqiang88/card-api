import { Controller, Post, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { Authorization } from '@/core/decorators/auth.decorator'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Authorization()
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  async logout(@Headers('authorization') authorization: string) {
    const token = authorization?.replace('Bearer ', '')
    return this.authService.logout(token)
  }
}
