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
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const inventory_service_1 = require("./inventory.service");
const update_stock_dto_1 = require("./dto/update-stock.dto");
const transfer_stock_dto_1 = require("./dto/transfer-stock.dto");
const query_stock_dto_1 = require("./dto/query-stock.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    updateStock(tenantId, userId, dto) {
        return this.inventoryService.updateStock(tenantId, dto, userId);
    }
    transferStock(tenantId, userId, dto) {
        return this.inventoryService.transferStock(tenantId, dto, userId);
    }
    findStock(tenantId, query) {
        return this.inventoryService.findStock(tenantId, query);
    }
    getKardex(tenantId, productId, warehouseId) {
        return this.inventoryService.getKardex(tenantId, productId, warehouseId);
    }
    getValuation(tenantId) {
        return this.inventoryService.getValuation(tenantId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Patch)('update-stock'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_stock_dto_1.UpdateStockDto]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Patch)('transfer'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN', 'SELLER'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, transfer_stock_dto_1.TransferStockDto]),
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
__decorate([
    (0, common_1.Get)('kardex'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __param(1, (0, common_1.Query)('productId')),
    __param(2, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getKardex", null);
__decorate([
    (0, common_1.Get)('valuation'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, get_tenant_id_decorator_1.GetTenantId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventoryController.prototype, "getValuation", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.UseGuards)(get_tenant_guard_1.GetTenantGuard),
    (0, common_1.Controller)('inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map