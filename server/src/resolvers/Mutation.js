const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const { transport, makeEmail } = require("../mail.js");
const { hasPermission } = require("../utils");
const stripe = require("../stripe");

const Mutation = {
  async createItem(parent, args, ctx, info) {
    // Check if user is logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          // Create a prisma relationship on the item and user
          user: {
            connect: {
              id: ctx.request.userId
            }
          },
          ...args
        }
      },
      info
    );
    return item;
  },

  async updateItem(parent, args, ctx, info) {
    const updates = { ...args };
    // remove ID from updates
    delete updates.id;
    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteItem(parent, args, ctx, info) {
    // Find the item
    const item = await ctx.db.query.item(
      { where: { id: args.id } },
      `{ id, title user { id }}`
    );
    // Check to see if the user owns that item, or has proper permissions
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    const ownsItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "ITEMDELETE"].includes(permission)
    );
    if (!ownsItem || !hasPermissions) {
      throw new Error("You dont have permission to do that!");
    }
    // Delete it
    return ctx.db.mutation.deleteItem({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    // Make all the email addresses lowercase
    args.email = args.email.toLowerCase();
    // Ensure the passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // Since we don't want to save the confirmPassword field, delete import PropTypes from 'prop-types'
    delete args.confirmPassword;
    // Hash/Salt the password
    const password = await bcrypt.hash(args.password, 10);
    // Create user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // Create the JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the JWT as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // Return user to the client
    return user;
  },

  async signin(parent, args, ctx, info) {
    // Since we made the emails lowercase in the signup mutation,
    // Ensure we do it here as well
    args.email = args.email.toLowerCase();
    // Check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // Check if the password is correct
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) {
      throw new Error("Invalid Password");
    }
    // Create the JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the JWT as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });
    // Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Successfully logged out!" };
  },

  async requestReset(parent, args, ctx, info) {
    // Check if the user exists
    const user = await ctx.db.query.user({ where: { email: args.email } });
    if (!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // Set a reset token and expiry on the user
    const resetToken = (await promisify(randomBytes)(20)).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 Hour from now
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });
    // Email the reset token
    try {
      const mailRes = await transport.sendMail({
        from: "help@swagbag.com",
        to: user.email,
        subject: "Your Password Reset Token",
        html: makeEmail(
          `Your password reset token is here! Follow this link to reset your password. \n\n <a href="${
            process.env.FRONTEND_URL
          }/reset?resetToken=${resetToken}">Click Here to Reset</a> `
        )
      });
    } catch (error) {
      throw new Error("Sorry, something went wrong!");
    }
    // Return the success message
    return { message: "Password Reset Email sent!" };
  },

  async resetPassword(parent, args, ctx, info) {
    // Check if passwords match
    if (args.password !== args.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    // Check if the token is valid
    // Check if the token is expired
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });
    if (!user) {
      throw new Error("This token is either invalid or expired");
    }
    // Hash the new password
    const password = await bcrypt.hash(args.password, 10);
    // Save the new password to the user and remove old resetToken fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    // Create the JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // Set the JWT as a cookie on the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // return the updated user
    return updatedUser;
  },

  async updatePermissions(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    // Check if they have permissions to do this
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);
    // Update permissions
    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },

  async addToCart(parent, args, ctx, info) {
    // Ensure user is signed in
    const userId = ctx.request.userId;
    if (!userId) throw new Error("You must be signed in to do that!");
    // Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      where: {
        user: { id: userId },
        item: { id: args.id }
      }
    });
    // Check if item is already in the cart
    if (existingCartItem) {
      // If so, increment the quantity
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + 1 }
        },
        info
      );
    }
    // If not, create a new cartItem for the user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },

  async removeFromCart(parent, args, ctx, info) {
    // Find the cart item
    const cartItem = await ctx.db.query.cartItem(
      { where: { id: args.id } },
      `{ id, user { id }}`
    );
    if (!cartItem) throw new Error("No CartItem Found!");
    // Make sure they own the cart item
    if (cartItem.user.id !== ctx.request.userId) {
      throw new Error("Hey! Don't do that!");
    }
    // Delete that item
    return ctx.db.mutation.deleteCartItem(
      {
        where: { id: args.id }
      },
      info
    );
  },

  async createOrder(parent, args, ctx, info) {
    // Get current user Info
    if (!ctx.request.userId)
      throw new Error("You must be logged in to complete this order!");
    const user = ctx.request.user;
    console.log(user);
    // Recalculate total for the price to ensure no funny business happened on the frontend
    const amount = user.cart.reduce(
      (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
      0
    );
    // Create the Stripe charge (turn token into $$)
    const charge = await stripe.charges.create({
      amount,
      currency: "USD",
      source: args.token,
      description: "SwagBag Order"
    });
    // Convert CartItem to OrderItem
    const orderItems = user.cart.map(cartItem => {
      const orderItem = {
        ...cartItem.item,
        quantity: cartItem.quantity,
        user: { connect: { id: user.id } }
      };
      delete orderItem.id;
      return orderItem;
    });
    // create the Order
    const order = await ctx.db.mutation.createOrder({
      data: {
        total: charge.amount,
        charge: charge.id,
        items: { create: orderItems },
        user: { connect: { id: user.id } }
      }
    });
    // Clean up - clear users cart, delete cartItems
    const cartItemIds = user.cart.map(cartItem => cartItem.id);
    await ctx.db.mutation.deleteManyCartItems({
      where: {
        id_in: cartItemIds
      }
    });
    // Return the order to the client
    return order;
  }
};

module.exports = Mutation;
