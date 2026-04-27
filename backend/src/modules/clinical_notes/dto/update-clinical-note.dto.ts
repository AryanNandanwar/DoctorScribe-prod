// dto/update-clinical-note.dto.ts
import {
  IsArray,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClinicalNoteDto {
      @IsOptional()
      @IsObject()
      patientDetails?: Record<string, string>;
    
      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      medicalHistory?: string[];
    
      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      @Transform(({ value }) => {
        // accept "foo" or ["foo", "bar"] and always store as array
        if (value == null) return undefined;
        return Array.isArray(value) ? value : [value];
      })
      problemFaced?: string[];
    
      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      doctorInstructions?: string[];
    
      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      medicationPrescribed?: string[];

      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      findings?: string[];

      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      diagnosis?: string[];

      @IsOptional()
      @IsArray()
      @IsString({ each: true })
      investigationsAdvised?: string[];

      @IsString()
      status?: 'Draft' | 'Confirmed';

      patientId?: string;

}
