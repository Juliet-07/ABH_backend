import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatusEnum } from 'src/constants';
import { UpdateOrderStatusDto } from 'src/orders/dto/update-order-status.dto';
import { Order } from 'src/orders/schema/order.schema';
import { Product } from 'src/products/schema/product.schema';

@Injectable()
export class StatisticService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async getOrdersByVendorId(vendorId: string) {
    try {
      const orders = await this.orderModel.find({
        'products.vendorId': vendorId,
      });
      return orders;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async acceptOrder(
    orderId: string,
    vendorId: string,
    
  ) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
        'products.vendorId': vendorId,
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const vendorProduct = order.products.find(
        (product) => product.vendorId === vendorId,
      );
      if (!vendorProduct) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { deliveryStatus: 'CONFIRMED' } },
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
    payload: OrderStatusEnum,
  ) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
        'products.vendorId': vendorId,
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const vendorProduct = order.products.find(
        (product) => product.vendorId === vendorId,
      );
      if (!vendorProduct) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException(`Payment not confirmed yet`);
      }

      const updatedStatus = await this.orderModel.findOneAndUpdate(
        { _id: orderId },
        { $set: { deliveryStatus: payload } },
        { new: true },
      );

      return updatedStatus;
    } catch (error) {
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
          'products.vendorId': vendorId, // Filter by vendorId
          status: 'paid', // Assuming you have a status field to check if the order is paid
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
    status,
    limit = 10,
    page = 1,
    vendorId,
  }: {
    status?: string;
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
        'products.vendorId': vendorId, // Match by vendorId in products
      };

      if (status) {
        matchCriteria.status = status.toUpperCase(); // Match by status if provided
      }

      // Fetch orders with pagination
      const data = await this.orderModel
        .find(matchCriteria)
        .skip(skip)
        .limit(pageSize)
        .select({
          _id: 1,
          status: 1,
          totalAmount: 1,
          createdAt: 1,
          // Add other fields you want to include in the response
        })
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

      return result; // Return the result
    } catch (error) {
      throw new Error(`Error fetching order status: ${error.message}`);
    }
  }

  async getMonthlyOrdersAndRevenueForVendor(vendorId: string) {
    try {
      const result = await this.orderModel.aggregate([
        {
          $match: {
            'products.vendorId': vendorId, // Match by vendorId in products
            status: 'paid', // Only consider paid orders
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' }, // Extract year from createdAt
              month: { $month: '$createdAt' }, // Extract month from createdAt
            },
            totalOrders: { $sum: 1 }, // Count total orders
            totalRevenue: { $sum: '$totalAmount' }, // Sum total revenue
          },
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1, // Sort by year and month
          },
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            year: '$_id.year',
            month: '$_id.month',
            totalOrders: 1,
            totalRevenue: 1,
          },
        },
      ]);

      return result; // Return the aggregated result
    } catch (error) {
      throw new Error(
        `Error fetching monthly orders and revenue for vendor: ${error.message}`,
      );
    }
  }
}
