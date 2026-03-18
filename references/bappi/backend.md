---
title: Bappi's Backend Patterns (NestJS)
description: NestJS microservices architecture — gateway + domain services, ClientProxy messaging, module structure, TypeORM, Redis, RabbitMQ, Firebase push, AWS S3, Ably websockets, throttling, Swagger, and Dockerfile/Jenkins deployment patterns.
type: reference
---

# Bappi's Backend Patterns (NestJS)

## Architecture: Gateway + Microservices

The canonical backend pattern is a gateway service in front of domain microservices:

```
apps/
  gateway/src/              ← HTTP entry point — no business logic
    modules/
      auth/auth.gateway.ts  ← @Controller("auth") — delegates to auth service
      [feature]/[feature].gateway.ts
  auth/src/                 ← Auth business logic + JWT + user management
    modules/
      auth/
        controller/auth.controller.ts
        services/auth.service.ts
  [domain]/src/             ← Domain-specific service (products, orders, etc.)
  admin/src/                ← Admin-only service
  socket/src/               ← WebSocket service (Ably / Socket.io)
  utility/src/              ← Shared utilities (email, SMS, file processing)
libs/
  common/                   ← Shared across all apps
    dtos/                   ← Request/response DTOs per domain
    enums/
      microservice.enum.ts  ← Service names for ClientProxy routing
      events.enum.ts        ← Event names per service
    guard/
      profile.guard.ts
      refresh-auth.guard.ts
    interceptors/
      payload-logging.interceptor.ts
    pipes/
      dto-validation.pipe.ts
    services/
      client-proxy.service.ts  ← Wraps ClientProxy.send()
      request.service.ts       ← Generates microservice payloads
```

---

## Gateway Controller Pattern

The gateway has zero business logic. It validates, wraps, and delegates:

```ts
@Controller("auth")
@ApiTags("User Authentication")
export class AuthGateway {
    private readonly authClient: ClientProxyService;

    constructor(
        @Inject(MicroserviceEnum.AUTH) clientProxy: ClientProxy,
        private readonly requestService: RequestService,
    ) {
        this.authClient = new ClientProxyService(clientProxy);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "User login" })
    @ApiBody({ type: LoginDto })
    async login(@Body(new DtoValidationPipe()) loginDto: LoginDto) {
        return this.authClient.send(
            AuthMicroEventEnum.LOGIN,
            this.requestService.generateMicroPayload(loginDto)
        );
    }

    @UseGuards(ProfileGuard)
    @Get("user")
    async getUser(@Headers("authorization") auth: string) {
        return this.authClient.send(AuthMicroEventEnum.GET_USER, { token: auth });
    }
}
```

**Rules:**
- Gateway never accesses database directly
- Gateway never contains business logic
- DTO validation happens at gateway boundary via `DtoValidationPipe`
- Responses are returned directly from `ClientProxy.send()` (NestJS handles Observable → Promise)

---

## App Module (Gateway)

```ts
@Module({
    imports: [
        EnvConfigModule,
        CommonServiceModule,
        PostgresConfigModule,
        HttpModule.register({ timeout: 50_000, maxRedirects: 5 }),
        ThrottlerModule.forRoot([
            { name: "short", ttl: 1000, limit: 3 },
            { name: "medium", ttl: 10_000, limit: 20 },
            { name: "long", ttl: 60_000, limit: 50 },
        ]),
        ScheduleModule.forRoot(),
        ServeStaticModule.forRoot({ serveRoot: "/public", rootPath: join(__dirname, "public") }),
        ...ModuleList,  // feature modules
    ],
    providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: PayloadLoggingInterceptor },
    ],
})
export class GatewayAppModule {}
```

---

## main.ts Bootstrap

```ts
async function bootstrap() {
    const app = await NestFactory.create(GatewayAppModule);

    app.enableCors();
    app.useGlobalPipes(new DataTransformGlobalPipe());
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: "v1" });

    // Swagger
    const config = new DocumentBuilder()
        .setTitle("API")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    SwaggerModule.setup("api", app, SwaggerModule.createDocument(app, config));

    await app.listen(process.env.PORT || 3000);
}
```

URI versioning: all routes automatically prefixed with `/v1/`.

---

## RabbitMQ Transport (Microservice Communication)

Services listen on RabbitMQ queues:

```ts
// main.ts of auth service
app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
        urls: [process.env.RABBITMQ_URL],
        queue: "auth_queue",
        queueOptions: { durable: false },
        noAck: false,
    },
});
await app.startAllMicroservices();
```

Gateway connects to each service:
```ts
// In module — register ClientProxy for each service
ClientsModule.registerAsync([{
    name: MicroserviceEnum.AUTH,
    useFactory: (configService) => ({
        transport: Transport.RMQ,
        options: {
            urls: [configService.get("RABBITMQ_URL")],
            queue: "auth_queue",
            queueOptions: { durable: false },
        },
    }),
    inject: [ConfigService],
}])
```

---

## Infrastructure Integrations

### PostgreSQL (TypeORM)
```ts
TypeOrmModule.forRootAsync({
    useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get("POSTGRES_URL"),
        entities: [User, Token, ...],
        synchronize: false,  // never true in production
        logging: true,
    }),
    inject: [ConfigService],
})
```

### Redis (Cache)
```ts
import { createClient } from "redis";
const client = createClient({ url: process.env.REDIS_URL });
```

### AWS S3 (File Uploads)
```ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Presigned URL for secure client-side upload
const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
```

Image processing with `sharp`:
```ts
import sharp from "sharp";
const resized = await sharp(buffer).resize(800, 600).jpeg({ quality: 80 }).toBuffer();
```

### Firebase Admin (Push Notifications)
```ts
import admin from "firebase-admin";
await admin.messaging().send({
    token: deviceToken,
    notification: { title, body },
    data: { type: "MESSAGE", payload: JSON.stringify(data) },
});
```

### Ably (Real-Time WebSockets)
```ts
import Ably from "ably";
const client = new Ably.Realtime({ key: process.env.ABLY_KEY });
const channel = client.channels.get(`user:${userId}`);
await channel.publish("message", { content, senderId });
```

### Nodemailer (Email)
```ts
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
});
```

---

## Cron Jobs

```ts
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SchedulerService {
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanExpiredTokens() {
        // ...
    }
}
```

---

## Dockerfile Pattern

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install -g bun && bun install
COPY . .
RUN bun run build:[service-name]

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/apps/[service-name]/main"]
```

One Dockerfile per microservice. Built in parallel via Jenkins.

---

## Jenkins Pipeline (Parallel Microservice Builds)

```groovy
pipeline {
    stages {
        stage("Checkout") {
            when { anyOf { branch "develop"; branch "staging"; branch "prod" } }
        }
        stage("Get env") {
            // Pull .env from Vault or secrets manager
        }
        stage("Apps Build") {
            parallel {
                stage("Auth")      { steps { sh "docker build -f apps/auth/Dockerfile ..." } }
                stage("Gateway")   { steps { sh "docker build -f apps/gateway/Dockerfile ..." } }
                stage("Client")    { steps { sh "docker build -f apps/client/Dockerfile ..." } }
                stage("Socket")    { steps { sh "docker build -f apps/socket/Dockerfile ..." } }
                stage("Utility")   { steps { sh "docker build -f apps/utility/Dockerfile ..." } }
            }
        }
        stage("Deploy") {
            steps { sh "ssh user@server 'cd /app && ./deploy.sh'" }
        }
    }
    post {
        always {
            office365ConnectorSend(status: currentBuild.currentResult, webhookUrl: env.TEAMS_WEBHOOK)
        }
    }
}
```

Parallel builds, then deploy. MS Teams notification on completion.

---

## Swagger Decorators

```ts
@ApiTags("Users")
@Controller("users")
export class UserGateway {
    @ApiBearerAuth()
    @ApiOperation({ summary: "Get current user" })
    @ApiResponse({ status: 200, type: UserDto })
    @Get("me")
    getMe() {}

    @ApiBody({ type: CreateUserDto })
    @Post()
    createUser(@Body() dto: CreateUserDto) {}
}
```
