import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { QueryMemberDto } from './dto/query-member.dto';

@ApiTags('会员管理')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: '创建会员' })
  @ApiResponse({ status: 201, description: '会员创建成功' })
  async create(@Body() createMemberDto: CreateMemberDto) {
    return await this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: '获取会员列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryMemberDto) {
    return await this.membersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取会员详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  async findOne(@Param('id') id: string) {
    return await this.membersService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新会员信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  @ApiResponse({ status: 409, description: '手机号已存在' })
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto
  ) {
    return await this.membersService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除会员' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '会员不存在' })
  async remove(@Param('id') id: string) {
    return await this.membersService.remove(+id);
  }
}
