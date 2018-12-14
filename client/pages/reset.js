import React, { Component } from "react";
import ResetForm from "../components/ResetForm";

export default class reset extends Component {
  render() {
    return (
      <div>
        <ResetForm resetToken={this.props.query.resetToken} />
      </div>
    );
  }
}
