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
import { LogisticService } from 'src/logistics/service/logistic.service';
import { MailingService } from 'src/utils/mailing/mailing.service';

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
    private logisticService: LogisticService,
    private mailingSerivce: MailingService,
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
      // Find the order and populate required fields
      const order = await this.singleOrderModel
        .findOne({
          orderId: orderId,
          vendorId: vendorId,
        })
        .populate('userId')
        .populate('vendorId')
        .populate('products.productId');

      // Ensure the order exists
      if (!order) {
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      }

      // Ensure the payment is confirmed
      if (order.status !== 'PAID') {
        throw new BadRequestException('Payment not confirmed yet');
      }

      // Save the updated delivery status to the database
      order.deliveryStatus = payload.deliveryStatus;
      await order.save();

      // Update delivery status in Order schema
      const allVendorOrders = await this.singleOrderModel.find({ orderId });

      const allSameStatus = allVendorOrders.every(
        (order) => order.deliveryStatus === payload.deliveryStatus,
      );

      if (allSameStatus) {
        await this.orderModel.findOneAndUpdate(
          { _id: orderId },
          { deliveryStatus: payload.deliveryStatus },
        );
      }

      // If the delivery status is "SHIPPED", prepare and send the pickup request
      if (payload.deliveryStatus === 'SHIPPED') {
        const sender = order.vendorId as any;
        const recipient = order.userId as any;

        // Extract shipment items
        const shipmentItems = (order.products as any).map((product: any) => ({
          ItemName: product.productId.name,
          ItemUnitCost: product.productId.price,
          ItemQuantity: product.quantity,
          ItemColour: product.productId.colour || 'N/A',
          ItemSize: product.productId.size || 'N/A',
        }));

        // Prepare the payload for the pickup request
        const submitPickupPayload = {
          OrderNo: order._id.toString(),
          // OrderNo: '6722a7d4633261412b23b834426c96f',
          Description: 'Products from order',

          Weight: order.products
            .map((product: any) => (product.productId.weight || 0).toString())
            .join(','),
          SenderName: `${(sender as any).firstName} ${
            (sender as any).lastName
          }`,
          SenderCity: (sender as any).city,
          SenderTownID: (sender as any).townId,
          SenderAddress: (sender as any).address,
          SenderPhone: (sender as any).phoneNumber,
          SenderEmail: (sender as any).email,
          RecipientName: `${(recipient as any).firstName} ${
            (recipient as any).lastName
          }`,
          RecipientCity: order.shippingAddress.city,
          RecipientTownID: order.shippingAddress.townId,
          RecipientAddress: order.shippingAddress.street,
          RecipientPhone: (recipient as any).phoneNumber,
          RecipientEmail: (recipient as any).email,
          PaymentType: 'Pay On Delivery',
          DeliveryType: 'Normal Delivery',
          PickupType: '1',
          ShipmentItems: shipmentItems,
        };

        // console.log(
        //   submitPickupPayload,
        //   'PICKUP PAYLOAD........................',
        // );

        // Send the request using logisticService
        const token = await this.logisticService.getAuthToken();
        if (token) {
          const result = await this.logisticService.submitPickupRequest(
            token,
            submitPickupPayload,
          );

          if (result.error || result?.TransStatus !== 'Successful') {
            throw new BadRequestException('Pickup request submission failed.');
          }

          // console.log('Pickup request successfully submitted:', result);

          try {
            const waybillNumber = result?.WaybillNumber || 'N/A';

            await this.mailingSerivce.send({
              subject: 'Pickup Confirmation',
              email: recipient.email,
              html: `${recipient.firstName} ${recipient.lastName}, Here is your waybill number: <b style="font-size: 20px;">${waybillNumber}</b>`,
            });
          } catch (error) {
            console.error('Error sending email:', error);
          }

          return {
            message: 'Pickup request successfully submitted.',
            response: result,
          };
        } else {
          throw new UnauthorizedException(
            'Authentication failed for pickup request.',
          );
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new BadRequestException(error.message);
    }
  }

  // async updateOrderStatus(
  //   orderId: string,
  //   vendorId: string,
  //   payload: UpdateOrderStatusDto1,
  // ) {
  //   try {
  //     const order = await this.singleOrderModel
  //       .findOne({
  //         orderId: orderId,
  //         vendorId: vendorId,
  //       })
  //       .populate('userId')
  //       .populate('orderId')
  //       .populate('vendorId')
  //       .populate('products.productId');

  //     if (!order) {
  //       throw new UnauthorizedException(
  //         'You are not authorized to update this order',
  //       );
  //     }

  //     if (order.status !== 'PAID') {
  //       throw new BadRequestException(`Payment not confirmed yet`);
  //     }

  //     const updatedStatus = await this.singleOrderModel.findOneAndUpdate(
  //       { _id: orderId },
  //       { $set: { deliveryStatus: payload.deliveryStatus } },
  //       { new: true },
  //     );

  //     return updatedStatus;
  //   } catch (error) {
  //     console.log(error);
  //     throw new BadRequestException(error.message);
  //   }
  // }

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
