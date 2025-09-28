import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';

@ApiTags('套餐管理')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @ApiOperation({ summary: '创建套餐' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createPackageDto: CreatePackageDto) {
    return await this.packagesService.create(createPackageDto);
  }

  @Get()
  @ApiOperation({ summary: '获取套餐列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryPackageDto) {
    return await this.packagesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取套餐详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  findOne(@Param('id') id: string) {
    return this.packagesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新套餐信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto) {
    return await this.packagesService.update(+id, updatePackageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除套餐' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  async remove(@Param('id') id: string) {
    return await this.packagesService.remove(+id);
  }
}
