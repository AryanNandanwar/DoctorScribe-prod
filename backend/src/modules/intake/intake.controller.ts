import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards, ForbiddenException, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateIntakePatientDto, UpdateIntakeStatusDto } from './dto/intake.dto';
import { IntakeService } from './intake.service';
import type { PatientIntakeStatus } from './entities/patient-intake.entity';

@Controller('intake')
@UseGuards(AuthGuard('jwt'))
export class IntakeController {
  constructor(private readonly intakeService: IntakeService) {}

  @Post('patients')
  async createPatient(@Req() req: any, @Body() dto: CreateIntakePatientDto) {
    if (req.user.role !== 'receptionist') {
      throw new ForbiddenException('Only receptionists can create intake patients');
    }

    return this.intakeService.createPatientIntake(
      req.user.doctorId,
      dto,
      req.user.id,
    );
  }

  @Get('queue')
  async listQueue(@Req() req: any, @Query('status') status = 'pending') {
    if (req.user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can view the intake queue');
    }

    return this.intakeService.listQueueForDoctor(req.user.id, status as PatientIntakeStatus);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateIntakeStatusDto,
  ) {
    if (req.user.role !== 'doctor') {
      throw new ForbiddenException('Only doctors can update intake status');
    }

    return this.intakeService.updateStatusForDoctor(req.user.id, id, dto.status);
  }
}
