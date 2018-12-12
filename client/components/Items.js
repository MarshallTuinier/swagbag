import React, { Component } from "react";
import { Query } from "react-apollo";
import styled from "styled-components";

import { ALL_ITEMS_QUERY } from "../GraphQL";
import Item from "./Item";
import { perPage } from "../config";
import Pagination from "./Pagination";

export default class Items extends Component {
  render() {
    return (
      <Center>
        <p>Items!</p>
        <Pagination page={this.props.page} />
        <Query
          query={ALL_ITEMS_QUERY}
          variables={{
            // Skip the appropriate amount of pages
            skip: this.props.page * perPage - perPage
          }}
        >
          {({ data, error, loading }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;
            return (
              <ItemsList>
                {data.items.map(item => (
                  <Item item={item} key={item.id} />
                ))}
              </ItemsList>
            );
          }}
        </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}

// -------------------- Styles -------------------- //

const Center = styled.div`
  text-align: center;
`;

const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
`;

export { ALL_ITEMS_QUERY };
