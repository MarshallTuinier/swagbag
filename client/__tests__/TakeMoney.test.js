import { mount } from "enzyme";
import { ApolloConsumer } from "react-apollo";
import wait from "waait";
import NProgress from "nprogress";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import TakeMoney from "../components/TakeMoney";
import { CREATE_ORDER_MUTATION, CURRENT_USER_QUERY } from "../GraphQL";
import { fakeUser, fakeCartItem } from "../lib/testUtils";

// Mock the router
Router.router = { push() {} };

const mocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: {
      data: {
        currentUser: {
          ...fakeUser(),
          cart: [fakeCartItem()]
        }
      }
    }
  }
];

describe("<TakeMoney />", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(toJSON(wrapper.find("ReactStripeCheckout"))).toMatchSnapshot();
  });

  it("creates an order ontoken", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz789"
        }
      }
    });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoney />
      </MockedProvider>
    );
    await wait();
    const component = wrapper.find("TakeMoney").instance();
    // manually call onToken method
    component.onToken({ id: "abc123 " }, createOrderMock);
    expect(createOrderMock).toHaveBeenCalled();
    expect(createOrderMock).toHaveBeenCalledWith({
      variables: { token: "abc123 " }
    });
  });

  it("turns the progress bar on", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz789"
        }
      }
    });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoney />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMoney").instance();

    NProgress.start = jest.fn();
    component.onToken({ id: "abc123" }, createOrderMock);
    expect(NProgress.start).toHaveBeenCalled();
  });

  it("routes to the order page when completed", async () => {
    const createOrderMock = jest.fn().mockResolvedValue({
      data: {
        createOrder: {
          id: "xyz789"
        }
      }
    });
    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <TakeMoney />
      </MockedProvider>
    );
    Router.router.push = jest.fn();
    await wait();
    wrapper.update();
    const component = wrapper.find("TakeMoney").instance();
    component.onToken({ id: "abc123 " }, createOrderMock);
    await wait();
    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/order",
      query: {
        id: "xyz789"
      }
    });
  });
});
