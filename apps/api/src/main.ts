import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // បើក CORS ដើម្បីអនុញ្ញាតឱ្យ Next.js (port 3000) អាច fetch ទិន្នន័យពី API (port 4000) បានដោយគ្មានបញ្ហារារាំង
  app.enableCors();

  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();