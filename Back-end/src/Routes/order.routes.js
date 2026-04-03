const express = require("express");
const route = express.Router();
const orderController = require("../Controllers/order.controller");
const requireAuth = require("../Middlewares/auth.middleware");
const adminAuthenticate = require("../Middlewares/admin.middleware");

// Admin-only sales/orders analytics routes
route.get("/weeklySales", adminAuthenticate, orderController.weeklySales);
route.get("/salesPerWeek", adminAuthenticate, orderController.salesPerWeek);
route.get("/dailySales", adminAuthenticate, orderController.dailySales);
route.get("/weekly", adminAuthenticate, orderController.weeklyOrders);
route.get("/daily", adminAuthenticate, orderController.dailyOrders);

// Specific named routes (BEFORE parameterized routes)
route.get("/status/:status", requireAuth, orderController.getOrderByStatus);

// Get all orders - requires auth; admin sees all orders, users see only their own
route.get("/", requireAuth, orderController.getAllOrders);

// Get order by ID - requires auth, users can only see their own orders (enforced in controller)
route.get("/:id", requireAuth, orderController.getOrderById);

// Protected order operations
route.post("/", requireAuth, orderController.createNewOrder);
route.put("/:id", requireAuth, orderController.updateOrderByID);
route.delete("/:id", requireAuth, orderController.deleteOrderByID);


module.exports = route;
