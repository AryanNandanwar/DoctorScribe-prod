// src/modules/patient/patient.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  Req,
  UseGuards,
  HttpCode
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto, MatchPatientDto, UpdatePatientDto } from './dto/patient.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('doctor/me/patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // ---------------------------------------
  // CREATE patient under the logged-in doctor
  // POST /doctor/me/patients
  // ---------------------------------------
  @Post()
  async createForDoctor(@Req() req: any, @Body() dto: CreatePatientDto) {
    const doctorId = req.user.id;
    return this.patientService.createForDoctor(doctorId, dto);
  }

  // ---------------------------------------
  // GET one patient that belongs to doctor
  // GET /doctor/me/patients/:patientId
  // ---------------------------------------
  @Get(':patientId')
  async getByIdForDoctor(@Req() req: any, @Param('patientId') patientId: string) {
    const doctorId = req.user.id;
    return this.patientService.findByIdForDoctor(doctorId, patientId);
  }

  // ---------------------------------------
  // LIST all patients of the doctor
  // GET /doctor/me/patients
  // ---------------------------------------
  @Get()
  async listForDoctor(
    @Req() req: any,
    @Query('limit') limit = '1000',
    @Query('q') q?: string,
  ) {
    const doctorId = req.user.id;
    console.log('DEBUG doctorId from req.user:', doctorId);
    const n = parseInt(limit, 10) || 50;

    // search mode
    if (q) {
      return this.patientService.searchForDoctor(doctorId, q, n);
    }

    // simple list
    return this.patientService.findPatientsForDoctor(doctorId, n);
  }

  // ---------------------------------------
  // UPDATE a patient belonging to doctor
  // PUT /doctor/me/patients/:patientId
  // ---------------------------------------
  @Put(':patientId')
  async updateForDoctor(
    @Req() req: any,
    @Param('patientId') patientId: string,
    @Body() dto: UpdatePatientDto,
  ) {
    const doctorId = req.user.id;
    return this.patientService.updateForDoctor(doctorId, patientId, dto);
  }

  // ---------------------------------------
  // DELETE a patient belonging to doctor
  // DELETE /doctor/me/patients/:patientId
  // ---------------------------------------
  @Delete(':patientId')
  async deleteForDoctor(@Req() req: any, @Param('patientId') patientId: string) {
    const doctorId = req.user.id;
    await this.patientService.deleteForDoctor(doctorId, patientId);
    return { message: 'Patient deleted successfully' };
  }

  // ---------------------------------------
  // MATCH PREVIEW (scoped to doctor)
  // POST /doctor/me/patients/matches/preview
  // ---------------------------------------
  @Post('matches/preview')
  @HttpCode(200)
  async previewMatchesForDoctor(
    @Req() req: any,
    @Body() dto: MatchPatientDto,
  ) {
    const doctorId = req.user.id;
    return this.patientService.findMatchesForDoctor(
      doctorId,
      dto,
    );
  }
}
