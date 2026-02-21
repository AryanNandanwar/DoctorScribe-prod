// src/clinical_notes/modules/clinical-notes/clinical-notes.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClinicalNotesService } from './clinical-notes.service';
import { CreateClinicalNoteDto } from './dto/clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('clinical-notes')
@UseGuards(AuthGuard('jwt'))
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateClinicalNoteDto) {
    const doctorId = req.user.id; // <-- depends on your JWT payload
    const patientId = dto.patientId;
    return this.clinicalNotesService.create(dto, doctorId, patientId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const doctorId = req.user.id;
    return this.clinicalNotesService.findAllForDoctor(doctorId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const doctorId = req.user.id;
    return this.clinicalNotesService.findOneForDoctor(doctorId, id);
  }

  @Patch(':id')
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateClinicalNoteDto,
  ) {
    const doctorId = req.user.id;
    return this.clinicalNotesService.updateForDoctor(id, dto, doctorId);
  }

  @Delete(':id')
  async remove(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const doctorId = req.user.id;
    await this.clinicalNotesService.delete(id, doctorId);
    return { message: 'Clinical note deleted successfully' };
  }
}
