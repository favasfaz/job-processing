import { Request, Response } from 'express';
import { getMetricsText } from '../../services/metrics.service';

export class MetricsController {
  metrics = (_req: Request, res: Response): void => {
    res.type('text/plain').send(getMetricsText());
  };
}
