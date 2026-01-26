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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const get_tenant_guard_1 = require("../auth/guards/get-tenant.guard");
const get_tenant_id_decorator_1 = require("../auth/decorators/get-tenant-id.decorator");
const inventory_service_1 = require("./inventory.service");
const update_stock_dto_1 = require("./dto/update-stock.dto");
const transfer_stock_dto_1 = require("./dto/transfer-stock.dto");
const query_stock_dto_1 = require("./dto/query-stock.dto");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    updateStock(tenantId, dto, req) {
        const user = req.user;
        const role = user?.role;
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only admins can update stock');
        }
        return this.inventoryService.updateStock(tenantId, dto);
    }
    transferStock(tenantId, dto, req) {
        const user = req.user;
        const role = user?.role;
        if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            throw new common_1.ForbiddenException('Only admins can transfer stock');
        }
        return this.inventoryService.transferStock(tenantId, dto);
    }
    findStock(tenantId, query) {
        return this.inventoryService.findStock(tenantId, query);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Patch)('update-stock'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_stock_dto_1.UpdateStockDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Patch)('transfer'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transfer_stock_dto_1.TransferStockDto, Object]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "transferStock", null);
__decorate([
    (0, common_1.Get)('stock'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_stock_dto_1.QueryStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "findStock", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)(get_tenant_guard_1.GetTenantGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map