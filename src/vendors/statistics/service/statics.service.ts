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
import { UpdateOrderStatusDto1 } from 'src/orders/dto/update-order-status.dto';
import { Order } from 'src/orders/schema/order.schema';
import { Product } from 'src/products/schema/product.schema';

import { Document } from 'mongoose';

export interface OrderDocument extends Document {
  status: PaymentStatus;
  deliveryStatus: OrderStatusEnum;
  userId: string;
  totalAmount: number;
  created_at: Date; // Custom name for createdAt
  updated_at: Date; // Custom name for updatedAt
}

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getOrdersByVendorId(vendorId: string, page: number, limit: number) {
    try {
      const skip = (page - 1) * limit;

      // Step 2: Fetch orders that contain products with the specified vendorId
      const orders = await this.orderModel
        .find({
          'products.vendorId': vendorId,
        })
        .sort({ createdAt: -1 })
        .populate({
          path: 'userId',
          select: '-password',
        })
        .populate('products.productId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalOrders = await this.orderModel.countDocuments({
        'products.vendorId': vendorId,
      });

      return {
        count: orders.length,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        orders,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async trackOrder(orderId: string, vendorId: string) {
    try {
      // Step 2: Fetch orders that contain these products
      const order = await this.orderModel
        .findOne({
          _id: orderId,
          vendorId: vendorId,
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!order) {
        throw new NotFoundException(
          'Order not found or does not belong to this vendor',
        );
      }

      return {
        order,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async acceptOrder(
    orderId: string,
    vendorId: string,
    payload: UpdateOrderStatusDto1,
  ) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
        'products.vendorId': vendorId,
      });

      if (!order) {
        throw new NotFoundException(
          'Order not found or does not belong to this vendor',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { deliveryStatus: payload.deliveryStatus } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
      throw new BadGatewayException(error.message);
    }
  }

  async updateOrderStatus(
    orderId: string,
    vendorId: string,
    payload: UpdateOrderStatusDto1,
  ) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
        'products.vendorId': vendorId,
      });

      if (!order) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { deliveryStatus: payload.deliveryStatus } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
      console.log(error);
      throw new BadGatewayException(error.message);
    }
  }

  async outOfstock(vendorId: string) {
    try {
      const products = await this.productModel.find({
        vendor: vendorId,
        inStock: false,
      });

      return products;
    } catch (error) {
      throw error;
    }
  }

  async totalProduct(vendorId: string) {
    try {
      const totalProduct = await this.productModel.countDocuments({
        vendor: vendorId,
      });

      return totalProduct;
    } catch (error) {
      throw error;
    }
  }

  async totalSalesForVendor(vendorId: string) {
    try {
      const totalSales = await this.orderModel
        .find({
          'products.vendorId': vendorId, 
          status: 'PAID', 
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

  async orderStatus({
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
        'products.vendorId': vendorId, 
      };

      if (
        deliveryStatus &&
        Object.values(OrderStatusEnum).includes(deliveryStatus)
      ) {
        matchCriteria.deliveryStatus = deliveryStatus;
      }

      // Fetch orders with pagination
      const data = await this.orderModel
        .find(matchCriteria)
        .skip(skip)
        .limit(pageSize)
        .exec();

      // Count total documents matching criteria
      const totalCount = await this.orderModel.countDocuments(matchCriteria);

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

  async getMonthlyOrdersAndRevenueForVendor(vendorId: string) {
    try {
      const orders = (await this.orderModel.find({
        'products.vendorId': vendorId, 
        status: 'PAID',
      })) as OrderDocument[]; // Cast to OrderDocument[]

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
