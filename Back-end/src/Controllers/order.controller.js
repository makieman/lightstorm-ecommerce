const OrderModel = require("../Models/order.model");
const orderValidate = require("../Middlewares/order.validation");
const { pickAllowedFields } = require("../Utils/sanitize");

// Allowed fields for order update
const ALLOWED_ORDER_FIELDS = [
  'status',
  'totalPrice',
  'date',
  'products'
];

/**
 * Get all orders
 * Returns all orders for admin, or only user's orders for non-admin
 */
let getAllOrders = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    let matchStage = {};
    // If user is not admin, only return their own orders
    if (!user.isAdmin) {
      matchStage = { userId: user._id };
    }

    let pipeline = [
      { $match: matchStage },
      {
        $project: {
          userId: 1,
          username: 1,
          totalPrice: 1,
          status: 1,
          products: 1,
          date: 1,
          daysDifference: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), "$date"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Get order by status
 */
let getOrderByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const allowedStatuses = ['Pending', 'Accepted', 'Rejected'];

    // Case-insensitive match against allowed values
    const matched = allowedStatuses.find(
      s => s.toLowerCase() === status.toLowerCase()
    );
    if (!matched) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`
      });
    }

    // Only return the current user's orders with this status
    const orders = await OrderModel.find({
      userId: req.user._id,
      status: matched
    });

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Get order by ID
 */
let getOrderById = async (req, res) => {
  try {
    let orderId = req.params.id;
    let order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Ownership check: users can only view their own orders, admins can view any
    if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only view your own orders" });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Create a new order
 */
let createNewOrder = (req, res) => {
  //
};

/**
 * Update order by ID
 */
let updateOrderByID = async (req, res) => {
  try {
    // Sanitize input - only allow expected fields to prevent mass assignment
    const sanitizedData = pickAllowedFields(req.body, ALLOWED_ORDER_FIELDS);
    let order = await OrderModel.findByIdAndUpdate(req.params.id, sanitizedData, {
      new: true,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

/**
 * Delete order by ID
 */
let deleteOrderByID = async (req, res) => {
  const orderId = req.params.id; // ID from the URL parameter

  if (!orderId) {
    return res.status(400).send({ message: "Order ID is required" });
  }

  try {
    const deletedOrder = await OrderModel.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).send({ message: "Order not found" });
    }
    res.send({ message: "Order deleted successfully", order: deletedOrder });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error deleting order", error: error.message });
  }
};
/**
 * Get weekly orders
 */
let weeklyOrders = async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          date: {
            $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    return res.json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
/**
 * Get daily orders
 */
let dailyOrders = async (req, res) => {
  try {
    let now = new Date();
    let yesterday = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1
    );

    let pipeline = [
      {
        $match: {
          date: {
            $gte: yesterday,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    return res.json(orders);
  } catch (error) {
    console.error("Error in dailyOrders:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.toString() });
  }
};

/**
 * Get weekly sales
 */
let weeklySales = async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          date: {
            $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    return res.json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
/**
 * Get daily sales
 */
let dailySales = async (req, res) => {
  try {
    let pipeline = [
      {
        $match: {
          date: {
            $gte: new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    return res.json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
/**
 * Get sales per week
 */
let salesPerWeek = async (req, res) => {
  try {
    let pipeline = [
      {
        $group: {
          _id: { $week: "$date" },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ];
    let orders = await OrderModel.aggregate(pipeline);
    return res.json(orders);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderByStatus,
  getOrderById,
  createNewOrder,
  updateOrderByID,
  deleteOrderByID,
  weeklyOrders,
  dailyOrders,
  weeklySales,
  dailySales,
  salesPerWeek,
};
