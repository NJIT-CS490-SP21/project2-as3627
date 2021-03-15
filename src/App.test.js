import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("When the user tries to login without a username", () => {
  const result = render(<App />);

  const loginElement = screen.getByText("Login");
  expect(loginElement).toBeInTheDocument();

  fireEvent.click(loginElement);
  expect(loginElement).toBeInTheDocument();
});
