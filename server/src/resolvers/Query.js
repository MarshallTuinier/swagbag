const { forwardTo } = require("prisma-binding");

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
  }
};

module.exports = Query;
