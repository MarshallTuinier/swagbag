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
  }
};

module.exports = Query;
