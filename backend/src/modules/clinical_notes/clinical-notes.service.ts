// src/clinical_notes/modules/clinical-notes/clinical-notes.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClinicalNoteDto } from './dto/clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import { Repository } from 'typeorm';
import { ClinicalNote } from './entity/clinical_notes.entity';
import { Doctor } from '../doctor/doctor.entity';
import { Patient } from '../patient/entities/patient.entity';


@Injectable()
export class ClinicalNotesService {
  constructor(
    @Inject('CLINICAL_NOTES_REPOSITORY')
    private readonly notesCollection: Repository<ClinicalNote>,

    @Inject('DOCTOR_REPOSITORY')
    private readonly doctorRepo: Repository<Doctor>,

    @Inject('PATIENT_REPOSITORY')
    private readonly patientRepo: Repository<Patient>,

  ) {}

  async create(dto: CreateClinicalNoteDto, doctorId: string, patientId: string): Promise<ClinicalNote> {

    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

      // 2. Validate patient
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    
    const payload: Partial<ClinicalNote> = {
      patientDetails: dto.patientDetails ? JSON.stringify(dto.patientDetails) : '{}',
      medicalHistory: dto.medicalHistory ? JSON.stringify(dto.medicalHistory) : '[]',
      problemsFaced: dto.problemFaced ? JSON.stringify(dto.problemFaced) : '[]',
      doctorInstructions: dto.doctorInstructions ? JSON.stringify(dto.doctorInstructions) : '[]',
      medicationPrescribed: dto.medicationPrescribed ? JSON.stringify(dto.medicationPrescribed) : '[]',
      doctor: doctor,
      patient: patient,
    };

    console.log('Creating clinical note with payload:', payload);

    const note = this.notesCollection.create(payload);
    return await this.notesCollection.save(note);
  }

   async findAllForDoctor(doctorId: string): Promise<ClinicalNote[]> {
    return this.notesCollection.find({
      where: { doctor: { id: doctorId } },
      relations: ['doctor', 'patient'],
    });
  }

  // Get a single note that belongs to a specific doctor
  async findOneForDoctor(doctorId: string, noteId: string): Promise<ClinicalNote> {
    const note = await this.notesCollection.findOne({
      where: {
        id: noteId,
        doctor: { id: doctorId },
      },
      relations: ['doctor', 'patient'],
    });

    if (!note) {
      throw new NotFoundException('Clinical note not found for this doctor');
    }

    return note;
  }

  async findById(id: string): Promise<ClinicalNote> {
    const note = await this.notesCollection.findOneBy({ id });
    if (!note) {
      throw new NotFoundException('Clinical note not found');
    }
    return note;
  } 

  async updateForDoctor(id: string, dto: UpdateClinicalNoteDto, doctorId: string): Promise<ClinicalNote> {
    const note = await this.findOneForDoctor(doctorId, id)

    if (dto.patientDetails !== undefined) {
      note.patientDetails = JSON.stringify(dto.patientDetails);
    }
    if (dto.medicalHistory !== undefined) {
      note.medicalHistory = JSON.stringify(dto.medicalHistory);
    }
    if (dto.problemFaced !== undefined) {
      note.problemsFaced = JSON.stringify(dto.problemFaced);
    }
    if (dto.doctorInstructions !== undefined) {
      note.doctorInstructions = JSON.stringify(dto.doctorInstructions);
    }
    if (dto.medicationPrescribed !== undefined) {
      note.medicationPrescribed = JSON.stringify(dto.medicationPrescribed);
    }

    return await this.notesCollection.save(note);
  }

  async delete(id: string, doctorId: string): Promise<void> {
    const note = await this.findOneForDoctor(doctorId, id); // throws if not found / not owned
    await this.notesCollection.remove(note);
  }

}

