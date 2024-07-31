import { Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import * as redis from 'redis';

@Injectable()
export class RedisService {

     private redisClient: RedisClientType;
     public redis_url: string;
     private readonly logger = new Logger(RedisService.name);

     constructor() {
          const redisUrl = process.env.REDIS_URL as string;
          this.redisClient = redis.createClient({
               url: redisUrl
          });

          this.redisClient
               .connect()
               .then(() =>
                    console.log('Connection established to Redis instance ...'),
               )
               .catch((error) => this.logger.error(error.message));
     }

     async set({ key, value, ttl }: { key: string; value: any; ttl?: number }) {
          try {
               const result = await this.redisClient.set(key, JSON.stringify(value), {
                    EX: ttl ?? 0,
               });
               return result;
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async setNumber({
          key,
          value,
          ttl,
     }: {
          key: string;
          value: number;
          ttl?: number;
     }) {
          try {
               const result = await this.redisClient.set(key, value, {
                    EX: ttl ?? 0,
               });
               return result;
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async push({ key, value }: { key: string; value: string }) {
          try {
               const result = await this.redisClient.lPush(key, value);
               return result;
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async get({ key }: { key: string }): Promise<string | boolean> {
          try {
               const result = await this.redisClient.get(key);
               if (!result || result === '') return false;

               return JSON.parse(result);
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async getNumber({ key }: { key: string }): Promise<number | boolean> {
          try {
               const result = await this.redisClient.get(key);
               if (!result || result === '') return false;

               return parseInt(result);
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async getList({ key }: { key: string }): Promise<string[] | boolean> {
          try {
               const result = await this.redisClient.lRange(key, 0, -1);
               if (!result || result.length === 0) return false;

               return result;
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

     async remove({ key }: { key: string }) {
          try {
               const result = await this.redisClient.del(key);
               result;
          } catch (error: any) {
               this.logger.error(error.message);
               return false;
          }
     }

}
