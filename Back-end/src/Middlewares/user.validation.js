const Ajv = require("ajv")
const addFormats = require("ajv-formats")
const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

// Validation schema for user input. Keep required fields minimal
// and rely on Mongoose defaults for server-side defaults.
const UserValidate = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    username: { type: "string", minLength: 1 },
    password: { type: "string", minLength: 6 },
    image: { type: "string" },
    orders: {
      type: "array",
      items: { type: "string" }
    },
    carts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          product: { type: "string" },
          quantity: { type: "number" }
        }
      }
    }
  },
  required: ["email", "username", "password"],
  additionalProperties: true
};

module.exports = ajv.compile(UserValidate);


