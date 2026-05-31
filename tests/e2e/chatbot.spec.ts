import { createElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChatWidget from "../../components/ChatWidget";

describe("chatbot e2e scaffold", () => {
  it("renders the chat widget shell", () => {
    render(createElement(ChatWidget));

    //matches your actual ChatWidget text
expect(screen.getByText(/FlowCRM Support/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /Open chat/i })).toBeInTheDocument();
  });
});