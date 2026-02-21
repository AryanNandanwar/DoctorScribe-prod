// src/clinical_notes/modules/clinical-notes/clinical-notes.providers.ts
import { DataSource } from "typeorm";
import { ClinicalNote } from "./entity/clinical_notes.entity";

export const clinicalNotesProviders = [
  {
    provide: 'CLINICAL_NOTES_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ClinicalNote),
    inject: ['POSTGRES_DATA_SOURCE'],
  },
];
