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