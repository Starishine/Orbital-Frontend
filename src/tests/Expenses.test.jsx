import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Expenses from "../pages/Expenses";
import { MemoryRouter } from "react-router-dom";
import * as jwt from "jwt-decode";
import "@testing-library/jest-dom";

// mock child components
vi.mock("../component/AddExpenseForm", () => ({
    default: () => <div>AddExpenseFormMock</div>,
}));
vi.mock("../component/ExistingExpense", () => ({
    default: () => <div>ExistingExpensesMock</div>,
}));

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// mock jwtDecode
vi.mock("jwt-decode", () => ({
    jwtDecode: vi.fn(),
}));

describe("Expenses Page", () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        jwt.jwtDecode.mockClear();
    });

    it("no token then it goes back to login", () => {
        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it(" gets username from token and shows final page", async () => {
        localStorage.setItem("token1", "faketoken");
        jwt.jwtDecode.mockReturnValue({ sub: "mousania" });

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
        localStorage.setItem("token1", "faketoken");
        jwt.jwtDecode.mockReturnValue({ sub: "mousania" });

        render(
            <MemoryRouter>
                <Expenses />
            </MemoryRouter>
        );

        expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard'); // href - hypertext reference , specifies the URL or path that the link points to and When a user clicks the link, the browser navigates to the URL in the href
        expect(screen.getByRole('link', { name: /exchange/i })).toHaveAttribute('href', '/exchange');
        expect(screen.getByRole('link', { name: /expenses/i })).toHaveAttribute('href', '/expenses');
        expect(screen.getByRole('link', { name: /visualisation/i })).toHaveAttribute('href', '/visualisation');
    });

});