const Ajv = require("ajv");
const ajv = new Ajv();

const productsSchema = {
    type: "object",
    properties: {
        title: { type: "string", maxLength: 100 },
        price: { type: "number", minimum: 0 },
        quantity: { type: "integer", minimum: 0 },
        type: { type: "string", enum: ["product", "service"] },
        details: { type: "string" },
        image: { type: "string" },
        category: { type: "string" },
        wattage: { type: "string" },
        voltage: { type: "string" },
        batteryType: { type: "string" },
        reviews: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    user_id: { type: "string" },
                    name: { type: "string" },
                    comment: { type: "string" },
                    rating: { type: "integer", minimum: 1, maximum: 5 },
                    date: { type: "string" }
                },
                required: ["name", "comment", "rating"],
                additionalProperties: false
            }
        }
    },
    required: ["title", "price", "quantity", "category"],
    additionalProperties: false
};

const validate = ajv.compile(productsSchema);
module.exports = validate;
