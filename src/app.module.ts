import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ItemsModule } from './items/items.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // グローバルに設定
    ConfigModule.forRoot({ isGlobal: true }),
    ItemsModule,
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}