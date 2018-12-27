import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";
import toJSON from "enzyme-to-json";
import Nav from "../components/Nav";
import { CURRENT_USER_QUERY } from "../GraphQL";
import { fakeUser } from "../lib/testUtils";

const notSignedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { currentUser: null } }
  }
];

const signedInMocks = [
  {
    request: { query: CURRENT_USER_QUERY },
    result: { data: { currentUser: fakeUser() } }
  }
];

describe("<Nav/>", () => {
  it("renders a minimal nav when signed out", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length).toBe(2);
  });

  it("renders full nav when signed in", async () => {
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <Nav />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    const nav = wrapper.find("ul[data-test='nav']");
    expect(nav.children().length).toBe(6);
    expect(nav.text()).toContain("Sign Out");
    const count = nav.find("div.count");
    expect(toJSON(count)).toMatchSnapshot();
  });
});
