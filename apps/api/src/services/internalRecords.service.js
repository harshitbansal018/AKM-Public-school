import {
  studentRepository,
  homeworkRepository,
  resultRepository,
  feeRecordRepository,
  facultySalaryRepository,
  jobApplicationRepository,
  policyRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

function createInternalService(repository, label) {
  return {
    async listAll() { return repository.findAll(); },
    async getById(id) {
      const row = await repository.findById(id);
      if (!row) throw ApiError.notFound(`${label} not found`);
      return row;
    },
    async create(data) { return repository.create(data); },
    async update(id, data) {
      await this.getById(id);
      return repository.update(id, data);
    },
    async remove(id) {
      await this.getById(id);
      await repository.remove(id);
      return { deleted: true };
    },
  };
}

export const studentService = createInternalService(studentRepository, 'Student');
export const homeworkService = createInternalService(homeworkRepository, 'Homework');
export const resultService = createInternalService(resultRepository, 'Result');
export const feeRecordService = createInternalService(feeRecordRepository, 'Fee record');
export const facultySalaryService = createInternalService(facultySalaryRepository, 'Salary record');
export const jobApplicationService = createInternalService(jobApplicationRepository, 'Job application');
export const policyService = createInternalService(policyRepository, 'Policy');

export async function listPublishedHomework() {
  return homeworkRepository.findPublished();
}

export async function listPublishedResults() {
  return resultRepository.findPublished();
}

export async function listActivePolicies() {
  return policyRepository.findAll().then((rows) => rows.filter((row) => row.status === 'ACTIVE'));
}
