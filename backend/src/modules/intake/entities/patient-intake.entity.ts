import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '../../doctor/doctor.entity';
import { Patient } from '../../patient/entities/patient.entity';
import { Receptionist } from '../../receptionist/receptionist.entity';

export type PatientIntakeStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

@Entity('patient_intakes')
export class PatientIntake {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'doctor_id', type: 'uuid' })
  doctorId: string;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Index()
  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'receptionist_id', type: 'uuid', nullable: true })
  receptionistId?: string | null;

  @ManyToOne(() => Receptionist, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'receptionist_id' })
  receptionist?: Receptionist | null;

  @Index()
  @Column({ type: 'text', default: 'pending' })
  status: PatientIntakeStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
