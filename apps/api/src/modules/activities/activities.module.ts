import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityListener } from './activity.listener';
import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Activity.name, schema: ActivitySchema }])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService, ActivityListener],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
