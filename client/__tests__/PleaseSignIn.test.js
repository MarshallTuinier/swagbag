import { mount } from "enzyme";
import wait from "waait";
import { MockedProvider } from "react-apollo/test-utils";

import PleaseSignIn from "../components/PleaseSignIn";
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

describe("<PleaseSignIn/>", () => {
  it("renders the sign in dialog to logged out users", async () => {
    const wrapper = mount(
      <MockedProvider mocks={notSignedInMocks}>
        <PleaseSignIn />
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.text()).toContain("Please Sign In before Continuing");
    expect(wrapper.find("SigninForm").exists()).toBe(true);
  });

  it("renders the child component when the user is signed in", async () => {
    const TestChild = () => <p>Test Child</p>;
    const wrapper = mount(
      <MockedProvider mocks={signedInMocks}>
        <PleaseSignIn>
          <TestChild />
        </PleaseSignIn>
      </MockedProvider>
    );
    await wait();
    wrapper.update();
    expect(wrapper.contains(<TestChild />)).toBe(true);
  });
});
