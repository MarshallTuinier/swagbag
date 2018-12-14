const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const { promisify } = require("util");

const { transport, makeEmail } = require("../mail.js");

const Mutation = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if user is logged in

    const item = await ctx.db.mutation.createItem(
      {
        data: {
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
    const where = { id: args.id };

    // Find the item
    const item = await ctx.db.query.item({ where }, `{ id, title}`);

    // Check to see if the user owns that item, or has proper permissions
    // TODO

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
  }
};

module.exports = Mutation;
