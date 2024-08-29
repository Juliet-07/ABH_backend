import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatusEnum, PaymentStatus } from 'src/constants';
import { Dropshipping } from 'src/dropshipping/schema/dropshipping.schema';
import { UpdateOrderStatusDto1 } from 'src/orders/dto/update-order-status.dto';

import { Document } from 'mongoose';

export interface DropshippingDocument extends Document {
  status: PaymentStatus;
  deliveryStatus: OrderStatusEnum;
  userId: string;
  totalAmount: number;
  created_at: Date; // Custom name for createdAt
  updated_at: Date; // Custom name for updatedAt
}

@Injectable()
export class DropshippingstatisticService {
  constructor(
    @InjectModel(Dropshipping.name)
    private dropshippingModel: Model<Dropshipping>,
  ) {}

  async getDropshippingByVendorId(
    vendorId: string,
    page: number,
    limit: number,
  ) {
    try {
      const skip = (page - 1) * limit;

      const dropshipping = await this.dropshippingModel
        .find({
          vendorId: vendorId,
        })
        .populate({
          path: 'userId',
          select: '-password',
        })
        .populate('products.productId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalOrders = await this.dropshippingModel.countDocuments({
        vendorId: vendorId,
      });

      return {
        count: dropshipping.length,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        dropshipping,
      };
    } catch (error) {
      console.error('Error fetching dropshipping:', error);
      throw error;
    }
  }

  async trackDropshipping(dropshippingId: string, vendorId: string) {
    try {
      const dropshipping = await this.dropshippingModel
        .findOne({
          _id: dropshippingId,
          vendorId: vendorId,
        })
        .exec();

      if (!dropshipping) {
        throw new NotFoundException(
          'DropshippingOrder not found or does not belong to this vendor',
        );
      }

      return {
        dropshipping,
      };
    } catch (error) {
      console.error('Error fetching dropshipping:', error);
      throw error;
    }
  }

  async acceptDropshipping(
    dropshippingId: string,
    vendorId: string,
    payload: UpdateOrderStatusDto1,
  ) {
    try {
      const dropshipping = await this.dropshippingModel.findOne({
        _id: dropshippingId,
        vendorId: vendorId,
      });

      if (!dropshipping) {
        throw new NotFoundException(
          'DropshippingOrder not found or does not belong to this vendor',
        );
      }

      if (dropshipping.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.dropshippingModel.findOneAndUpdate(
        { _id: dropshippingId },
        { $set: { deliveryStatus: payload.deliveryStatus } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async updatedropshippingStatus(
    dropshippingId: string,
    vendorId: string,
    payload: UpdateOrderStatusDto1,
  ) {
    try {
      const dropshipping = await this.dropshippingModel.findOne({
        _id: dropshippingId,
        vendorId: vendorId,
      });

      if (!dropshipping) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      if (dropshipping.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.dropshippingModel.findOneAndUpdate(
        { _id: dropshippingId },
        { $set: { deliveryStatus: payload.deliveryStatus } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
      console.log(error);
      throw new BadGatewayException(error.message);
    }
  }

  async totalSalesForDropshipping(vendorId: string) {
    try {
      const totalSales = await this.dropshippingModel
        .find({
          vendorId: vendorId, // Filter by vendorId
          status: 'PAID', // Assuming you have a status field to check if the order is paid
        })
        .exec();

      // Calculate total sales amount
      const totalAmount = totalSales.reduce(
        (acc, order) => acc + order.totalAmount,
        0,
      );

      return totalAmount; // Return the total sales amount
    } catch (error) {
      throw new Error(
        `Error calculating total sales for vendor: ${error.message}`,
      );
    }
  }

  async dropshippingStatus({
    deliveryStatus,
    limit = 10,
    page = 1,
    vendorId,
  }: {
    deliveryStatus?: OrderStatusEnum;
    limit?: number;
    page?: number;
    vendorId: string;
  }) {
    try {
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;

      // Build the match criteria
      const matchCriteria: Record<string, any> = {
        vendorId: vendorId,
      };

      if (
        deliveryStatus &&
        Object.values(OrderStatusEnum).includes(deliveryStatus)
      ) {
        matchCriteria.deliveryStatus = deliveryStatus;
      }

      // Fetch orders with pagination
      const data = await this.dropshippingModel
        .find(matchCriteria)
        .skip(skip)
        .limit(pageSize)
        .exec();

      // Count total documents matching criteria
      const totalCount = await this.dropshippingModel.countDocuments(
        matchCriteria,
      );

      // Prepare the result
      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching order status: ${error.message}`);
    }
  }

  async getMonthlyDropshippingAndRevenueForVendor(vendorId: string) {
    try {
      const orders = (await this.dropshippingModel.find({
        vendorId: vendorId,
        status: 'PAID',
      })) as DropshippingDocument[]; // Cast to OrderDocument[]

      const monthlyData: {
        [key: string]: {
          year: number;
          month: number;
          totalOrders: number;
          totalRevenue: number;
        };
      } = {};

      orders.forEach((order) => {
        const createdAt = new Date(order.created_at); // Use created_at instead of createdAt
        const year = createdAt.getFullYear();
        const month = createdAt.getMonth() + 1; // Months are zero-indexed

        const key = `${year}-${month}`;

        if (!monthlyData[key]) {
          monthlyData[key] = {
            year: year,
            month: month,
            totalOrders: 0,
            totalRevenue: 0,
          };
        }

        monthlyData[key].totalOrders += 1;
        monthlyData[key].totalRevenue += order.totalAmount;
      });

      const result = Object.values(monthlyData);
      console.log(result);
      return result;
    } catch (error) {
      throw new Error(
        `Error fetching monthly orders and revenue for vendor: ${error.message}`,
      );
    }
  }
}
