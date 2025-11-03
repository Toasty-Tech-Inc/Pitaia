import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, PrismaHealthIndicator } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private prisma: PrismaHealthIndicator,
        private prismaService: PrismaService
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('dashboard', 'https://new-pitaia-dashboard.vercel.app'),
            () => this.http.pingCheck('menu', 'https://pitaia-six.vercel.app'),
            () => this.http.pingCheck('web', 'https://pitaia-web.vercel.app'),
            () => this.prisma.pingCheck('database', this.prismaService),
        ]);
    }
}
