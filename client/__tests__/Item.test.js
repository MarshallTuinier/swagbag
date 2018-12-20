import ItemComponent from "../Components/Item";
import { shallow } from "enzyme";

const fakeItem = {
  id: "ABC123",
  title: "Sweet Item",
  price: 5000,
  description: "Reaaallllyyy sweet item.",
  image: "sickThing.jpg",
  largeImage: "largeSickThing.jpg"
};

describe("<Item />", () => {
  const wrapper = shallow(<ItemComponent item={fakeItem} />);
  it("renders and displays price/title", () => {
    const PriceTag = wrapper.find("Item__PriceTag");
    expect(PriceTag.children().text()).toBe("$50");
    expect(wrapper.find("Item__Title a").text()).toBe(fakeItem.title);
  });
  it("renders the image properly", () => {
    const img = wrapper.find("img");
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  it("renders buttons properly", () => {
    const buttonList = wrapper.find(".buttonList");
    expect(buttonList.children()).toHaveLength(3);
    expect(buttonList.find("Link")).toHaveLength(1);
    expect(buttonList.find("AddToCart").exists()).toBe(true);
    expect(buttonList.find("DeleteItem").exists()).toBe(true);
  });
});
