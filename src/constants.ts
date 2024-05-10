export const jwtConstants = {
    secret: process.env.JWT_SECRET
}

export enum UserTypeEnums {
    USER = 'USER',
    RENTER = 'RENTER',
    LANDLORD = 'LANDLORD',
}