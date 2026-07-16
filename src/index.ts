import { createApp } from './app';
import { config } from './config';
import { logger } from './services/logger.service';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info(`API listening on port ${config.PORT}`);
});
