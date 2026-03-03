const express = require("express");
const route = express.Router();
const orderController = require("../Controllers/order.controller");
const requireAuth = require("../Middlewares/auth.middleware");

route.get("/weeklySales", orderController.weeklySales);
route.get("/salesPerWeek", orderController.salesPerWeek);
route.get("/dailySales", orderController.dailySales);
route.get("/weekly", orderController.weeklyOrders);
route.get("/daily", orderController.dailyOrders);
route.get("/", orderController.getAllOrders);
route.get("/:id", orderController.getOrderById);
route.get("/:status", orderController.getOrderByStatus);
route.post("/", requireAuth, orderController.createNewOrder);
route.put("/:id", requireAuth, orderController.updateOrderByID);
route.delete("/:id", requireAuth, orderController.deleteOrderByID);


module.exports = route;
