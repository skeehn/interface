import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

/** Render a component and return RTL utils + a user-event instance + the root element. */
export function renderC(ui: ReactElement) {
  const utils = render(ui);
  return {
    ...utils,
    user: userEvent.setup(),
    root: utils.container.firstElementChild as HTMLElement,
  };
}
