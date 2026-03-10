const express = require("express");
const route = express.Router();
const productsController = require("../Controllers/product.controller");
const multerConfig = require("../Middlewares/multer");

route.get("/", productsController.getAllProducts);
route.get("/featured", productsController.getFeaturedProducts);
route.get("/user/product/token", productsController.getUserByToken);
route.post("/product/addtocart", productsController.addToCart);
route.get("/:id", productsController.getProductByID);
route.post("/", multerConfig, productsController.createNewProduct);
// Note: getProductByName is ambiguous with getProductById. Consider removing or using a different path like /by-name/:title
// route.get("/:title", productsController.getProductByName); 
route.put("/:id", multerConfig, productsController.updateProductByID);
route.delete("/:id", productsController.deleteProductByID);
route.post("/:id/reviews", productsController.addReview);


module.exports = route;
