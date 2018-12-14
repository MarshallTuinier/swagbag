import React, { Component } from "react";
import { Mutation } from "react-apollo";
import { DELETE_ITEM_MUTATION, ALL_ITEMS_QUERY } from "../GraphQL";

export default class DeleteItem extends Component {
  // This update function manually updates the client cahce so it matches the server
  update = (cache, payload) => {
    // Read the cache for the items we want
    const data = cache.readQuery({ query: ALL_ITEMS_QUERY });

    // Filter the deleted item out of the page
    data.items = data.items.filter(
      item => item.id !== payload.data.deleteItem.id
    );

    // Put the items back
    cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
  };

  render() {
    return (
      <Mutation
        mutation={DELETE_ITEM_MUTATION}
        variables={{ id: this.props.id }}
        update={this.update}
      >
        {(deleteItem, { error }) => (
          <button
            onClick={() => {
              if (confirm("Are you sure you want to delete this item?")) {
                deleteItem().catch(error => {
                  alert(error.message);
                });
              }
            }}
          >
            {this.props.children}
          </button>
        )}
      </Mutation>
    );
  }
}
