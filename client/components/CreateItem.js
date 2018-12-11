import React, { Component } from "react";
import { Mutation } from "react-apollo";
import styled, { keyframes } from "styled-components";
import Router from "next/router";

import ErrorMessage from "./ErrorMessage";
import { CREATE_ITEM_MUTATION } from "../GraphQL";

export default class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    price: "",
    image: "",
    largeImage: ""
  };

  handleChange = event => {
    const { name, type, value } = event.target;
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };

  uploadFile = async event => {
    const file = event.target.files;
    const data = new FormData();
    data.append("file", file[0]);
    data.append("upload_preset", "swagbag");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dgt29ucc1/image/upload",
      {
        method: "POST",
        body: data
      }
    );

    const json = await response.json();
    console.log(json);
    this.setState({
      image: json.secure_url,
      largeImage: json.eager[0].secure_url
    });
  };

  handleSubmit = async (event, createItem) => {
    // Stop form from submitting
    event.preventDefault();

    // Call the mutation
    const response = await createItem();

    // Bring the user to the single item page
    Router.push({
      pathname: "/item",
      query: { id: response.data.createItem.id }
    });
  };

  render() {
    const { title, price, description } = this.state;

    return (
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form onSubmit={event => this.handleSubmit(event, createItem)}>
            <ErrorMessage error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  onChange={this.uploadFile}
                  required
                />
                {this.state.image && (
                  <img
                    src={this.state.image}
                    alt="Upload Preview"
                    width="200"
                  />
                )}
              </label>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  value={title}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  value={price}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <label htmlFor="description">
                Description
                <textarea
                  type=""
                  id="description"
                  name="description"
                  placeholder="Enter a description"
                  value={description}
                  onChange={this.handleChange}
                  required
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

// -------------------- Styles -------------------- //

const loading = keyframes`
  from {
    background-position: 0 0;
  }

  to {
    background-position: 100% 100%;
  }
`;

const Form = styled.form`
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.05);
  background: rgba(0, 0, 0, 0.02);
  border: 5px solid white;
  padding: 20px;
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: 600;
  label {
    display: block;
    margin-bottom: 1rem;
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid black;
    &:focus {
      outline: 0;
      border-color: ${props => props.theme.red};
    }
  }
  button,
  input[type="submit"] {
    width: auto;
    background: red;
    color: white;
    border: 0;
    font-size: 2rem;
    font-weight: 600;
    padding: 0.5rem 1.2rem;
  }
  fieldset {
    border: 0;
    padding: 0;

    &[disabled] {
      opacity: 0.5;
    }
    &::before {
      height: 10px;
      content: "";
      display: block;
      background-image: linear-gradient(
        to right,
        #ff3019 0%,
        #e2b04a 50%,
        #ff3019 100%
      );
    }
    &[aria-busy="true"]::before {
      background-size: 50% auto;
      animation: ${loading} 0.5s linear infinite;
    }
  }
`;
