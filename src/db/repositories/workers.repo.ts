import { query } from '../pool';

export class WorkersRepository {
  async register(hostname: string, pid: number): Promise<string> {
    const { rows } = await query<{ id: string }>(
      `INSERT INTO workers (hostname, pid, status) VALUES ($1, $2, 'ACTIVE') RETURNING id`,
      [hostname, pid],
    );
    return rows[0].id;
  }

  async heartbeat(id: string): Promise<void> {
    await query('UPDATE workers SET last_heartbeat = NOW(), status = $1 WHERE id = $2', ['ACTIVE', id]);
  }
}
