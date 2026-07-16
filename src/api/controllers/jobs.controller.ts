import { Request, Response, NextFunction } from 'express';
import { JobsService } from '../../services/jobs.service';

export class JobsController {
  constructor(private readonly jobsService = new JobsService()) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.jobsService.createJob(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawStatus = req.query.status;
      const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 20);
      const result = await this.jobsService.listJobs(status as any, page, pageSize);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const job = await this.jobsService.getJob(id);
      res.json(job);
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await this.jobsService.cancelJob(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
