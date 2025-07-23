import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, beforeEach, afterEach, expect, it, describe } from "vitest";
import CreateSharedBudgetForm from "../component/CreateSharedBudgetForm";
import "@testing-library/jest-dom";

// Mock child components
vi.mock("../component/CurrencyDropdown", () => ({
  default: ({ currency, setCurrency }) => (
    <select
      data-testid="currency-dropdown"
      value={currency}
      onChange={e => setCurrency(e.target.value)}
    >
      <option value="SGD">SGD</option>
      <option value="USD">USD</option>
    </select>
  ),
}));
vi.mock("../component/InviteMembersForm", () => ({
  default: ({ invites, setInvites }) => (
    <div>
      <input
        data-testid="invite-input"
        value={invites.join(",")}
        onChange={e => setInvites(e.target.value.split(","))}
        placeholder="Invite Members"
      />
    </div>
  ),
}));

vi.mock("axios");
import axios from "axios";

describe("CreateSharedBudgetForm", () => {
  let alertSpy;
  const originalReload = window.location.reload;

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.setItem("token", "test-token");
    window.localStorage.setItem("username", "User");
    window.localStorage.setItem("email", "No email provided");
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    Object.defineProperty(window.location, "reload", {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
    Object.defineProperty(window.location, "reload", {
      configurable: true,
      value: originalReload,
    });
  });

  it("renders all fields and child components", () => {
    render(<CreateSharedBudgetForm />);
    expect(screen.getByPlaceholderText(/budget name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/amount/i)).toBeInTheDocument();
    expect(screen.getByTestId("currency-dropdown")).toBeInTheDocument();
    expect(screen.getByTestId("invite-input")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create budget/i })).toBeInTheDocument();
  });

  it("shows error if fields are empty", async () => {
    render(<CreateSharedBudgetForm />);
    fireEvent.click(screen.getByRole("button", { name: /create budget/i }));
    const errorMessage = await screen.findByText("Please fill in all fields");
    expect(errorMessage).toBeInTheDocument();
  });

  it("submits correct data to backend and resets form on success", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: "SUCCESS",
        code: 200,
        data: { id: "123", budgetName: "Trip", amountAllocated: 50, amount: 50, currency: "USD", invites: ["alice"] }
      }
    });

    render(<CreateSharedBudgetForm />);
    fireEvent.change(screen.getByPlaceholderText(/budget name/i), { target: { value: "Trip" } });
    fireEvent.change(screen.getByTestId("invite-input"), { target: { value: "alice" } });
    fireEvent.change(screen.getByTestId("currency-dropdown"), { target: { value: "USD" } });
    fireEvent.change(screen.getByPlaceholderText(/amount/i), { target: { value: "50" } });

    fireEvent.click(screen.getByRole("button", { name: /create budget/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:8080/shared-budget/create",
        {
          budgetName: "Trip",
          amountAllocated: 50,
          amount: 50,
          currency: "USD",
          invites: ["alice"],
          inviter: "User",
          inviterEmail: "No email provided"
        },
        { headers: { Authorization: "Bearer test-token" } }
      );
      expect(alertSpy).toHaveBeenCalledWith("Shared budget created successfully!");
      // Form reset
      expect(screen.getByPlaceholderText(/budget name/i)).toHaveValue("");
      expect(screen.getByPlaceholderText(/amount/i)).toHaveValue(""); // number input resets to ""
      expect(screen.getByTestId("currency-dropdown")).toHaveValue("SGD");
      expect(screen.getByTestId("invite-input")).toHaveValue("");
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("shows backend error message if backend returns error", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        status: "ERROR",
        code: 400,
        message: "Budget already exists"
      }
    });

    render(<CreateSharedBudgetForm />);
    fireEvent.change(screen.getByPlaceholderText(/budget name/i), { target: { value: "Trip" } });
    fireEvent.change(screen.getByPlaceholderText(/amount/i), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: /create budget/i }));

    await waitFor(() => {
      expect(screen.getByText(/budget already exists/i)).toBeInTheDocument();
    });
  });

  it("shows network error if axios throws", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<CreateSharedBudgetForm />);
    fireEvent.change(screen.getByPlaceholderText(/budget name/i), { target: { value: "Trip" } });
    fireEvent.change(screen.getByPlaceholderText(/amount/i), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: /create budget/i }));

    await waitFor(() => {
      expect(screen.getByText(/an error occurred while creating the shared budget/i)).toBeInTheDocument();
    });
  });

  it("sends Authorization header with token from localStorage", async () => {
    axios.post.mockResolvedValueOnce({
      data: { status: "SUCCESS", code: 200, data: {} }
    });

    render(<CreateSharedBudgetForm />);
    fireEvent.change(screen.getByPlaceholderText(/budget name/i), { target: { value: "Trip" } });
    fireEvent.change(screen.getByPlaceholderText(/amount/i), { target: { value: "50" } });
    fireEvent.click(screen.getByRole("button", { name: /create budget/i }));

     await waitFor(() => {
      expect(axios.post.mock.calls[0][2].headers.Authorization).toBe("Bearer test-token");
    });
  });
});