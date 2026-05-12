import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/entities/patient.entity';
import { Receptionist } from '../receptionist/receptionist.entity';
import { CreateIntakePatientDto } from './dto/intake.dto';
import { PatientIntake, PatientIntakeStatus } from './entities/patient-intake.entity';

@Injectable()
export class IntakeService {
  constructor(
    @Inject('PATIENT_INTAKE_REPOSITORY')
    private readonly intakeRepo: Repository<PatientIntake>,
    @Inject('PATIENT_REPOSITORY')
    private readonly patientRepo: Repository<Patient>,
    @Inject('DOCTOR_REPOSITORY')
    private readonly doctorRepo: Repository<Doctor>,
    @Inject('RECEPTIONIST_REPOSITORY')
    private readonly receptionistRepo: Repository<Receptionist>,
  ) {}

  async createPatientIntake(
    doctorId: string,
    dto: CreateIntakePatientDto,
    receptionistId?: string,
  ) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let receptionist: Receptionist | null = null;
    if (receptionistId) {
      receptionist = await this.receptionistRepo.findOne({
        where: { id: receptionistId, doctorId },
      });
      if (!receptionist) throw new ForbiddenException('Receptionist is not assigned to this doctor');
    }

    const trimmedPhone = dto.phone?.trim();
    let patient: Patient | null = null;
    if (trimmedPhone) {
      patient = await this.patientRepo.findOne({
        where: { phone: trimmedPhone, doctorId },
      });
    }

    if (patient) {
      Object.assign(patient, {
        fullName: dto.fullName,
        gender: dto.gender,
        age: dto.age,
        phone: trimmedPhone,
      });
    } else {
      patient = this.patientRepo.create({
        fullName: dto.fullName,
        gender: dto.gender,
        age: dto.age,
        phone: trimmedPhone,
        doctor,
        doctorId,
      });
    }

    const savedPatient = await this.patientRepo.save(patient);
    const intake = this.intakeRepo.create({
      doctor,
      doctorId,
      patient: savedPatient,
      patientId: savedPatient.id,
      receptionist: receptionist ?? null,
      receptionistId: receptionist?.id ?? null,
      status: 'pending',
    });

    return this.intakeRepo.save(intake);
  }

  async listQueueForDoctor(doctorId: string, status: PatientIntakeStatus = 'pending') {
    return this.intakeRepo.find({
      where: { doctorId, status },
      relations: ['patient', 'receptionist'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatusForDoctor(doctorId: string, intakeId: string, status: PatientIntakeStatus) {
    const intake = await this.intakeRepo.findOne({
      where: { id: intakeId, doctorId },
      relations: ['patient', 'receptionist'],
    });
    if (!intake) throw new NotFoundException('Intake not found for this doctor');

    intake.status = status;
    return this.intakeRepo.save(intake);
  }

  async completeForDoctor(doctorId: string, intakeId?: string) {
    if (!intakeId) return null;
    try {
      return await this.updateStatusForDoctor(doctorId, intakeId, 'completed');
    } catch (error) {
      throw new BadRequestException('Clinical note saved, but intake could not be completed');
    }
  }
}
