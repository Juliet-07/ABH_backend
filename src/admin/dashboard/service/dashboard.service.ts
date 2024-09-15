import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderStatusEnum, PaymentStatus } from 'src/constants';
import { Dropshipping } from 'src/dropshipping/schema/dropshipping.schema';
import { Order } from 'src/orders/schema/order.schema';
import { Product } from 'src/products/schema/product.schema';
import { Subscription } from 'src/subscription/schema/subscription.schema';
import { User } from 'src/user/schema/user.schema';
import { Vendor } from 'src/vendors/schema/vendor.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Dropshipping.name)
    private dropshippingModel: Model<Dropshipping>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async listAllVendorsProduct(vendor: string) {
    try {
      const products = await this.productModel.find({ vendor: vendor });

      return {
        count: products.length,
        products,
      };
    } catch (error) {
      throw new NotFoundException(`Product not found`);
    }
  }

  private getTimeFilters() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const yearStart = new Date(today.getFullYear(), 0, 1);

    return { today, weekStart, monthStart, yearStart };
  }

  private async getOrderCountByStatusAndTimeRange(
    status: OrderStatusEnum,
    startDate: Date,
  ): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          status,
          created_at: { $gte: startDate },
        },
      },
      {
        $count: 'count',
      },
    ]);

    return result.length > 0 ? result[0].count : 0;
  }

  async dashBoard() {
    try {
      const totalCustomers = await this.userModel.countDocuments();

      const totalVendors = await this.vendorModel.countDocuments();

      const totalOrders = await this.orderModel.countDocuments();

      const calculateTotalRevenue = await this.orderModel.aggregate([
        {
          $match: {
            status: PaymentStatus.PAID,
          },
        },
        {
          $group: {
            _id: null, // Group all documents together
            totalRevenue: { $sum: '$totalAmount' }, // Sum the `totalAmount` field
          },
        },
      ]);
      const { today, weekStart, monthStart, yearStart } = this.getTimeFilters();

      return {
        customers: totalCustomers,
        vendors: totalVendors,
        orders: totalOrders,
        revenue:
          calculateTotalRevenue.length > 0
            ? calculateTotalRevenue[0].totalRevenue
            : 0,
        saleHistory: this.getMonthlySales,

        today: {
          total: await this.getOrderCountByStatusAndTimeRange(null, today),
          pending: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PENDING,
            today,
          ),
          delivered: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DELIVERED,
            today,
          ),
          declined: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DECLINED,
            today,
          ),
          processing: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PROCESSING,
            today,
          ),
        },
        weekly: {
          total: await this.getOrderCountByStatusAndTimeRange(null, weekStart),
          pending: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PENDING,
            weekStart,
          ),
          delivered: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DELIVERED,
            weekStart,
          ),
          declined: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DECLINED,
            weekStart,
          ),
          processing: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PROCESSING,
            weekStart,
          ),
        },
        monthly: {
          total: await this.getOrderCountByStatusAndTimeRange(null, monthStart),
          pending: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PENDING,
            monthStart,
          ),
          delivered: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DELIVERED,
            monthStart,
          ),
          declined: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DECLINED,
            monthStart,
          ),
          processing: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PROCESSING,
            monthStart,
          ),
        },
        yearly: {
          total: await this.getOrderCountByStatusAndTimeRange(null, yearStart),
          pending: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PENDING,
            yearStart,
          ),
          delivered: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DELIVERED,
            yearStart,
          ),
          declined: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.DECLINED,
            yearStart,
          ),
          processing: await this.getOrderCountByStatusAndTimeRange(
            OrderStatusEnum.PROCESSING,
            yearStart,
          ),
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async getMonthlySales(): Promise<number[]> {
    const salesData = await this.orderModel.aggregate([
      {
        $match: {
          status: PaymentStatus.PAID, // Only consider paid orders
        },
      },
      {
        $group: {
          _id: { $month: '$created_at' }, // Group by month
          totalSales: { $sum: '$totalAmount' }, // Sum the totalAmount
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);

    // Create an array for total sales for each month (Jan-Dec)
    const monthlySales = Array(12).fill(0);
    salesData.forEach((sale) => {
      monthlySales[sale._id - 1] = sale.totalSales; // _id is the month (1-12)
    });

    return monthlySales;
  }

  async findAll(limit = 50, page = 1) {
    try {
      // Ensure limit and page are positive integers
      limit = Math.max(1, limit);
      page = Math.max(1, page);

      // Calculate the number of documents to skip
      const skip = (page - 1) * limit;

      // Fetch paginated documents
      const orders = await this.orderModel
        .find()
        .limit(limit)
        .skip(skip)
        .populate('products.productId')
        .populate('transactionId');

      // Count total number of documents
      const totalCount = await this.orderModel.countDocuments();

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      return {
        totalCount,
        currentPage: page,
        prevPage,
        nextPage,
        currentLimit: limit,
        totalPages,
        data: orders.length > 0 ? orders : null,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }

  async findOneOrder(orderId: string) {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
      });

      if (!order) throw new NotFoundException(`Order not found`);

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async trackOder(orderId: string): Promise<Order> {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
      });

      if (!order) throw new NotFoundException(`Order not found`);

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listAllDropshipping({
    status,
    limit = 10,
    page = 1,
  }: {
    status?: string;
    limit?: number;
    page?: number;
  }) {
    try {
      const pageSize = Math.max(1, limit);
      const currentPage = Math.max(1, page);
      const skip = (currentPage - 1) * pageSize;

      const defaultStatus = 'PENDING';

      // Build search criteria
      const searchCriteria: Record<string, any> = {};

      if (status) {
        searchCriteria.status = status.toUpperCase();
      } else {
        searchCriteria.status = defaultStatus;
      }

      console.log('Search criteria:', searchCriteria);

      const data = await this.dropshippingModel
        .find(searchCriteria)
        .skip(skip)
        .limit(pageSize)
        .exec();

      const totalCount = await this.dropshippingModel.countDocuments(
        searchCriteria,
      );

      const result = {
        page: pageSize,
        currentPage,
        totalPages: Math.ceil(totalCount / pageSize),
        data,
      };

      return result;
    } catch (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
  }

  async listAllSubscribers() {
    try {
      const result = await this.subscriptionModel
        .find()
        .populate({ path: 'userId', select: ['-password'] });

      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async subscribeData() {
    try {
      const totalSubScribers = await this.subscriptionModel.countDocuments();
      const totalAmount = await this.subscriptionModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      const totalWeeklySub = await this.subscriptionModel.countDocuments({
        type: 'WEEKLY',
      });

      const totalWeeklyAmount = await this.subscriptionModel.aggregate([
        {
          $match: { type: 'WEEKLY' },
        },
        {
          $group: {
            _id: null,
            totalWeeklyAmount: { $sum: '$amount' },
          },
        },
      ]);

      const totalDailySubscribers = await this.subscriptionModel.countDocuments(
        { type: 'DAILY' },
      );

      const totalDailyAmount = await this.subscriptionModel.aggregate([
        {
          $match: { type: 'DAILY' },
        },
        {
          $group: {
            _id: null,
            totalDailyAmount: { $sum: '$amount' },
          },
        },
      ]);

      const totalMonthlySubscribers =
        await this.subscriptionModel.countDocuments({ type: 'MONTHLY' });

      const totalMonthlyAmount = await this.subscriptionModel.aggregate([
        {
          $match: { type: 'MONTHLY' },
        },
        {
          $group: {
            _id: null,
            totalMonthlyAmount: { $sum: '$amount' },
          },
        },
      ]);

      return {
        totalSubScribeUsers: totalSubScribers,
        totalSubscribersAmount: totalAmount,
        totalWeeklySubscribers: totalWeeklySub,
        totalWeeklyAmount:
          totalWeeklyAmount.length > 0
            ? totalWeeklyAmount[0].totalWeeklyAmount
            : 0,
        totalDailySubscribers: totalDailySubscribers,
        totalDailyAmount:
          totalDailyAmount.length > 0
            ? totalDailyAmount[0].totalDailyAmount
            : 0,
        totalMonthlySubscribers: totalMonthlySubscribers,
        totalMonthlyAmount:
          totalMonthlyAmount.length > 0
            ? totalMonthlyAmount[0].totalMonthlyAmount
            : 0,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
