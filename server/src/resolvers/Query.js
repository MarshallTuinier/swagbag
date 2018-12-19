const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");
const Query = {
  items: forwardTo("db"),

  item: forwardTo("db"),

  itemsConnection: forwardTo("db"),

  currentUser(parent, args, ctx, info) {
    // Chceck if there is a current user ID
    // If not, return null
    if (!ctx.request.userId) {
      return null;
    }
    // Return the user
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },

  async users(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) {
      throw newError("You must be logged in to do that!");
    }

    // Check if the user has permissions to query all the users
    hasPermission(ctx.request.user, ["ADMIN", "PERMISSIONUPDATE"]);

    // If they do, query the users
    return ctx.db.query.users({}, info);
  },

  async order(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    // Query the order
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );
    // Check if they have permissions to see the order
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermission = ctx.request.user.permissions.includes("ADMIN");
    if (!(ownsOrder || hasPermission)) {
      throw new Error("You don't have permission to see this!");
    }
    // Return the order
    return order;
  },

  async orders(parent, args, ctx, info) {
    // Check if logged in
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    // Query the orders
    return ctx.db.query.orders(
      {
        where: {
          user: { id: ctx.request.userId }
        }
      },
      info
    );
  }
};

module.exports = Query;
