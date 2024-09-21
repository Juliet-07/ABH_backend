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
import { SingleOrder } from 'src/orders/schema/singleOreder.schema';

export interface OrderDocument extends Document {
  status: PaymentStatus;
  deliveryStatus: OrderStatusEnum;
  userId: string;
  totalAmount: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(SingleOrder.name) private singleOrderModel: Model<SingleOrder>,
  ) {}
  async getOrdersByVendorId(vendorId: string) {
    try {
      const orders = await this.singleOrderModel
        .find({ vendorId })
        .sort({ createdAt: -1 })
        .populate({
          path: 'userId',
          select: '-password',
        })
        .populate('products.productId')
        .exec();

      console.log(orders);

      return {
        count: orders.length,
        orders,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Could not fetch orders for the vendor.');
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
      const order = await this.singleOrderModel.findOne({
        _id: orderId,
        vendorId: vendorId,
      });

      if (!order) {
        throw new NotFoundException(
          'Order not found or does not belong to this vendor',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.singleOrderModel.findOneAndUpdate(
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
      const order = await this.singleOrderModel.findOne({
        _id: orderId,
        vendorId: vendorId,
      });

      if (!order) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.singleOrderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { deliveryStatus: payload.deliveryStatus } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
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
      const totalSales = await this.singleOrderModel
        .find({
          vendorId,
          status: 'PAID',
        })
        .exec();

      const totalAmount = totalSales.reduce((acc, order) => {
        return acc + order.price;
      }, 0);

      return totalAmount;
    } catch (error) {
      throw new Error(
        `Error calculating total sales for vendor: ${error.message}`,
      );
    }
  }

  async orderStatus({ deliveryStatus, vendorId }) {
    try {
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
      const data = await this.singleOrderModel.find(matchCriteria).exec();

      // Prepare the result
      const result = {
        count: data.length,
        data,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching order status: ${error.message}`);
    }
  }

  async getMonthlyOrdersAndRevenueForVendor(vendorId: string) {
    try {
      // Fetch all paid orders for the specified vendor
      const orders = (await this.singleOrderModel.find({
        vendorId: vendorId,
        status: 'PAID',
      })) as OrderDocument[];
      console.log(orders);

      // Initialize an object to hold monthly data
      const monthlyData: {
        [key: string]: {
          year: number;
          month: number;
          totalOrders: number;
          totalRevenue: number;
        };
      } = {};

      // Process each order to aggregate monthly data
      orders.forEach((order) => {
        const createdAt = new Date(order.created_at);
        const year = createdAt.getFullYear();
        const month = createdAt.getMonth() + 1; // Months are zero-indexed

        const key = `${year}-${month}`;

        // Initialize monthly data if it doesn't exist
        if (!monthlyData[key]) {
          monthlyData[key] = {
            year,
            month,
            totalOrders: 0,
            totalRevenue: 0,
          };
        }

        // Update totals for the month
        monthlyData[key].totalOrders += 1;
        monthlyData[key].totalRevenue += order.totalAmount;
      });

      // Convert the monthly data object to an array for easier handling
      const result = Object.values(monthlyData);
      console.log(result); // Log the result for debugging
      return result; // Return the aggregated monthly data
    } catch (error) {
      throw new Error(
        `Error fetching monthly orders and revenue for vendor: ${error.message}`,
      );
    }
  }
}
