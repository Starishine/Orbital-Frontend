import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Expenses from "../pages/Expenses";
import { MemoryRouter } from "react-router-dom";
import * as jwt from "jwt-decode";
import "@testing-library/jest-dom";

// Mock child components
vi.mock("../component/AddExpenseForm", () => ({
    default: () => <div>AddExpenseFormMock</div>,
}));
vi.mock("../component/ExistingExpense", () => ({
    default: () => <div>ExistingExpensesMock</div>,
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock jwtDecode
vi.mock("jwt-decode", () => ({
    jwtDecode: vi.fn(),
}));

describe("Expenses Page", () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        jwt.jwtDecode.mockClear();
    });

    it("redirects to login if no token", () => {
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("extracts username from token and renders page", async () => {
        localStorage.setItem("token", "fake-token");
        jwt.jwtDecode.mockReturnValue({ sub: "testuser" });

        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        expect(await screen.findByText(/set your expenses/i)).toBeInTheDocument();
        expect(screen.getByText(/addexpenseformmock/i)).toBeInTheDocument();
        expect(screen.getByText(/existingexpensesmock/i)).toBeInTheDocument();
    });

    it("renders navigation links", () => {
        localStorage.setItem("token", "fake-token");
        jwt.jwtDecode.mockReturnValue({ sub: "testuser" });

        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
        expect(screen.getByRole('link', { name: /exchange/i })).toHaveAttribute('href', '/exchange');
        expect(screen.getByRole('link', { name: /expenses/i })).toHaveAttribute('href', '/expenses');
        expect(screen.getByRole('link', { name: /visualisation/i })).toHaveAttribute('href', '/visualisation');
    });

});