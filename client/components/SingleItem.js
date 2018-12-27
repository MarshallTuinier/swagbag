import React, { Component } from "react";
import { Query } from "react-apollo";
import styled from "styled-components";
import Head from "next/head";

import Error from "./ErrorMessage";
import { SINGLE_ITEM_QUERY } from "../GraphQL";

export default class SingleItem extends Component {
  render() {
    return (
      <Query query={SINGLE_ITEM_QUERY} variables={{ id: this.props.id }}>
        {({ error, loading, data }) => {
          if (error) return <Error error={error} />;
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No item found!</p>;
          const item = data.item;
          return (
            <StyledSingleItem>
              <Head>
                <title>SwagBag | {item.title}</title>
              </Head>
              <img src={item.largeImage} alt={item.title} />
              <div className="details">
                <h2>Viewing {item.title}</h2>
                <p>{item.description}</p>
              </div>
            </StyledSingleItem>
          );
        }}
      </Query>
    );
  }
}

// -------------------- Styles -------------------- //

const StyledSingleItem = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.boxShadow};
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    font-size: 2rem;
  }
`;
