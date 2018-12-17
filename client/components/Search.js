import React, { Component } from "react";
import Downshift, { resetIdCounter } from "downshift";
import Router from "next/router";
import styled, { keyframes } from "styled-components";
import { ApolloConsumer } from "react-apollo";
import debounce from "lodash.debounce";

import { SEARCH_ITEMS_QUERY } from "../GraphQL";

export default class Search extends Component {
  state = {
    items: [],
    loading: false
  };

  handleChange = debounce(async (event, client) => {
    // Turn loading on
    this.setState({ loading: true });
    // Manually Query Apollo Client
    const response = await client.query({
      query: SEARCH_ITEMS_QUERY,
      variables: { searchTerm: event.target.value }
    });
    this.setState({ items: response.data.items, loading: false });
  }, 350);

  routeToItem = item => {
    Router.push({
      pathname: "/item",
      query: {
        id: item.id
      }
    });
  };

  render() {
    resetIdCounter();
    return (
      <SearchStyles>
        <Downshift
          itemToString={item => (item === null ? "" : item.title)}
          onChange={this.routeToItem}
        >
          {({
            getInputProps,
            getItemProps,
            isOpen,
            inputValue,
            highlightedIndex
          }) => {
            return (
              <div>
                <ApolloConsumer>
                  {client => (
                    <input
                      {...getInputProps({
                        type: "search",
                        placeholder: "Search for an Item",
                        id: "search",
                        className: this.state.loading ? "loading" : "",
                        onChange: event => {
                          event.persist();
                          this.handleChange(event, client);
                        }
                      })}
                    />
                  )}
                </ApolloConsumer>
                {isOpen && (
                  <DropDown>
                    {this.state.items.map((item, index) => (
                      <DropDownItem
                        key={item.id}
                        {...getItemProps({ item })}
                        highlighted={index === highlightedIndex}
                      >
                        <img src={item.image} alt={item.title} width="50" />
                        {item.title}
                      </DropDownItem>
                    ))}
                    {!this.state.items.length && !this.state.loading && (
                      <DropDownItem>
                        Nothing Found for {inputValue}
                      </DropDownItem>
                    )}
                  </DropDown>
                )}
              </div>
            );
          }}
        </Downshift>
      </SearchStyles>
    );
  }
}

// -------------------- Styles -------------------- //

const DropDown = styled.div`
  position: absolute;
  width: 100%;
  z-index: 2;
  border: 1px solid ${props => props.theme.lightGrey};
`;

const DropDownItem = styled.div`
  border-bottom: 1px solid ${props => props.theme.lightGrey};
  background: ${props => (props.highlighted ? "#f7f7f7" : "white")};
  padding: 1rem;
  transition: all 0.2s;
  ${props => (props.highlighted ? "padding-left: 2rem;" : null)};
  display: flex;
  align-items: center;
  border-left: 10px solid
    ${props => (props.highlighted ? props.theme.lightGrey : "white")};
  img {
    margin-right: 10px;
  }
`;

const glow = keyframes`
  from {
    box-shadow: 0 0 0px yellow;
  }

  to {
    box-shadow: 0 0 10px 1px yellow;
  }
`;

const SearchStyles = styled.div`
  position: relative;
  input {
    width: 100%;
    padding: 10px;
    border: 0;
    font-size: 2rem;
    &.loading {
      animation: ${glow} 0.5s ease-in-out infinite alternate;
    }
  }
`;
