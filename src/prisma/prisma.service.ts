import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool, type PoolConfig } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL nao definida no ambiente.');
    }

    const pool = new Pool(PrismaService.buildPoolConfig(connectionString));
    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private static buildPoolConfig(connectionString: string): PoolConfig {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get('sslmode');
    const sslCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, '\n');
    const shouldUseSsl = Boolean(sslMode && sslMode !== 'disable');

    if (!shouldUseSsl) {
      return {
        connectionString,
      };
    }

    // node-postgres replaces the ssl object when sslmode is present in the
    // connection string, so runtime SSL options need to be passed separately.
    url.searchParams.delete('sslmode');
    url.searchParams.delete('sslcert');
    url.searchParams.delete('sslkey');
    url.searchParams.delete('sslrootcert');

    const rejectUnauthorized =
      process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'true'
        ? true
        : process.env.DATABASE_SSL_REJECT_UNAUTHORIZED === 'false'
          ? false
          : Boolean(sslCa);

    return {
      connectionString: url.toString(),
      ssl: sslCa
        ? {
            ca: sslCa,
            rejectUnauthorized,
          }
        : {
            rejectUnauthorized,
          },
    };
  }
}
