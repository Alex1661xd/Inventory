"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTenantId = void 0;
const common_1 = require("@nestjs/common");
exports.GetTenantId = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.tenantId;
});
//# sourceMappingURL=get-tenant-id.decorator.js.map