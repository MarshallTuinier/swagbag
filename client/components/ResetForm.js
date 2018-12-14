import React, { Component } from "react";
import { Mutation } from "react-apollo";
import styled, { keyframes } from "styled-components";
import Error from "./ErrorMessage";

import { RESET_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";

export default class Reset extends Component {
  state = {
    password: "",
    confirmPassword: ""
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { password, confirmPassword } = this.state;
    return (
      <Mutation
        mutation={RESET_MUTATION}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(resetPassword, { error, loading, called }) => {
          return (
            <Form
              method="post"
              onSubmit={async event => {
                event.preventDefault();
                await resetPassword({
                  variables: {
                    resetToken: this.props.resetToken,
                    ...this.state
                  }
                });
                this.setState({
                  password: "",
                  confirmPassword: ""
                });
              }}
            >
              <fieldset disabled={loading} aria-busy={loading}>
                <h2>Reset Your Password</h2>
                <Error error={error} />
                {!error && !loading && called && (
                  <p>Success! Your password has been reset!</p>
                )}
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={password}
                  onChange={this.handleChange}
                  required={true}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={this.handleChange}
                  required={true}
                />
                <button type="submit">Reset your Password!</button>
              </fieldset>
            </Form>
          );
        }}
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
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid black;
    margin-bottom: 1rem;
    &:focus {
      outline: 0;
      border-color: ${({ theme }) => theme.red};
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

  button[disabled] {
    opacity: 0.5;
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
