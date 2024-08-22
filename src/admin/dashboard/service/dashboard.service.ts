import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { OrderStatusEnum } from "src/constants";
import { Order } from "src/orders/schema/order.schema";
import { User } from "src/user/schema/user.schem";
import { Vendor } from "src/vendors/schema/vendor.schema";





@Injectable()
export class DashboardService {
     constructor(
          @InjectModel(User.name) private userModel: Model<User>,
          @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
          @InjectModel(Order.name) private orderModel: Model<Order>,
     ) { }

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
               const totalCustomers = await this.userModel.countDocuments()

               const totalVendors = await this.vendorModel.countDocuments()

               const totalOrders = await this.orderModel.countDocuments()

               const calculateTotalRevenue = await this.orderModel.aggregate([
                    {
                         $match: {
                              status: OrderStatusEnum.PAID,
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
                    revenue: calculateTotalRevenue.length > 0 ? calculateTotalRevenue[0].totalRevenue : 0,
                    saleHistory: this.getMonthlySales,


                    today: {
                         total: await this.getOrderCountByStatusAndTimeRange(null, today),
                         pending: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PENDING, today),
                         delivered: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DELIVERED, today),
                         declined: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DECLINED, today),
                         processing: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PROCESSING, today),
                    },
                    weekly: {
                         total: await this.getOrderCountByStatusAndTimeRange(null, weekStart),
                         pending: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PENDING, weekStart),
                         delivered: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DELIVERED, weekStart),
                         declined: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DECLINED, weekStart),
                         processing: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PROCESSING, weekStart),
                    },
                    monthly: {
                         total: await this.getOrderCountByStatusAndTimeRange(null, monthStart),
                         pending: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PENDING, monthStart),
                         delivered: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DELIVERED, monthStart),
                         declined: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DECLINED, monthStart),
                         processing: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PROCESSING, monthStart),
                    },
                    yearly: {
                         total: await this.getOrderCountByStatusAndTimeRange(null, yearStart),
                         pending: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PENDING, yearStart),
                         delivered: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DELIVERED, yearStart),
                         declined: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.DECLINED, yearStart),
                         processing: await this.getOrderCountByStatusAndTimeRange(OrderStatusEnum.PROCESSING, yearStart),
                    },


               }
          } catch (error) {
               throw new BadRequestException(error.message);
          }
     }




     private async getMonthlySales(): Promise<number[]> {
          const salesData = await this.orderModel.aggregate([
               {
                    $match: {
                         status: OrderStatusEnum.PAID, // Only consider paid orders
                    },
               },
               {
                    $group: {
                         _id: { $month: "$created_at" }, // Group by month
                         totalSales: { $sum: "$totalAmount" }, // Sum the totalAmount
                    },
               },
               {
                    $sort: { _id: 1 }, // Sort by month
               },
          ]);

          // Create an array for total sales for each month (Jan-Dec)
          const monthlySales = Array(12).fill(0);
          salesData.forEach(sale => {
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

                    _id: orderId

               })

               if (!order) throw new NotFoundException(`Order not found`)

               return order;
          } catch (error) {
               throw new BadRequestException(error.message);
          }
     }


     async trackOder(orderId: string): Promise<Order> {
          try {
               const order = await this.orderModel.findOne({

                    _id: orderId

               })

               if (!order) throw new NotFoundException(`Order not found`)

               return order;
          } catch (error) {
               throw new BadRequestException(error.message);
          }
     }

}

