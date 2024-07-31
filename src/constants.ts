export const jwtConstants = {
    secret: process.env.JWT_SECRET
}

export enum UserTypeEnums {
    USER = 'USER',
    RENTER = 'RENTER',
    LANDLORD = 'LANDLORD',
}

export enum AdminRolesEnums {
    CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
    OPERATIONS = 'OPERATIONS',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum VendorStatusEnums {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    BLOCKED = 'BLOCKED',
    DECLINED = 'DECLINED',
}

export enum ProductStatusEnums {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    DECLINED = 'DECLINED',
}

export enum OrderStatusEnum {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    DECLINED = 'DECLINED',
    PROCESSING = 'PROCESSING',
    READY_TO_SHIP = 'READY_TO_SHIP',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    RETURNED = 'RETURNED',
}

export enum PaymentGatewayEnums {
    HYDROGENPAY = "HYDROGENPAY",
}

export enum PaymentStatusEnum {
    PENDING = "PENDING",
    SUCCESSFUL = "SUCCESSFUL",
    FAILED = "FAILED",
}

export enum ShippingMethodEnums {
    GIG_LOGISTICS = "GIG_LOGISTICS",
    NIPOST = "NIPOST",
    OFFLINE = "OFFLINE",
}


export enum BlockStatusEnums {
    BLOCKED = "BLOCKED",
    ACTIVE = "ACTIVE",
}