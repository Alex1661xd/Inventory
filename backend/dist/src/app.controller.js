"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const cache_service_1 = require("./cache/cache.service");
let AppController = class AppController {
    appService;
    cacheService;
    constructor(appService, cacheService) {
        this.appService = appService;
        this.cacheService = cacheService;
    }
    getHello() {
        return this.appService.getHello();
    }
    getHealth() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            redis: process.env.REDIS_HOST || 'not configured',
        };
    }
    async testCache() {
        const testKey = 'test-cache-key';
        const cached = await this.cacheService.get(testKey);
        if (cached) {
            return {
                message: '✅ Redis funcionando correctamente',
                cached: true,
                data: cached,
                timestamp: new Date().toISOString(),
            };
        }
        const testData = {
            message: 'Esta es una prueba de caché',
            generatedAt: new Date().toISOString(),
            randomNumber: Math.random(),
        };
        await this.cacheService.set(testKey, testData, 60);
        return {
            message: '📝 Datos guardados en caché (llama este endpoint de nuevo para verificar)',
            cached: false,
            data: testData,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('cache-test'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testCache", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        cache_service_1.CacheService])
], AppController);
//# sourceMappingURL=app.controller.js.map