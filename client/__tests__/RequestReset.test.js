import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import RequestResetForm from "../components/RequestResetForm";
import { REQUEST_RESET_MUTATION } from "../GraphQL";

const mocks = [
  {
    request: {
      query: REQUEST_RESET_MUTATION,
      variables: { email: "mtuinier@gmail.com" }
    },
    result: {
      data: { requestReset: { message: "success", __typename: "Message" } }
    }
  }
];

describe("<RequestResetForm />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <RequestResetForm />
      </MockedProvider>
    );
    const form = wrapper.find("form[data-test='form']");
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("calls the mutation successfully", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <RequestResetForm />
      </MockedProvider>
    );
    // Simulate typing
    wrapper.find("input").simulate("change", {
      target: { name: "email", value: "mtuinier@gmail.com" }
    });
    // Submit the form
    wrapper.find("form").simulate("submit");
    await wait();
    wrapper.update();
    expect(wrapper.find("p").text()).toContain(
      "Success! Check your email for a reset link!"
    );
  });
});
