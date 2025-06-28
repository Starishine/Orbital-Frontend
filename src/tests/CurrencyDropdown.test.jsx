import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CurrencyDropdown from "../component/CurrencyDropdown";
import axios from "axios";
import "@testing-library/jest-dom";

vi.mock("axios");

describe("CurrencyDropdown", () => {
    const mockRates = {
        SGD: 1.35,
        USD: 1,
        EUR: 0.9,
    };
    const setCurrency = vi.fn();

    beforeEach(() => {
        setCurrency.mockClear();
        axios.get.mockReset();
        axios.get.mockResolvedValue({ data: { rates: mockRates } });
        localStorage.clear();
    });

    it("fetches and renders currency options from API", async () => {
        render(<CurrencyDropdown currency="USD" setCurrency={setCurrency} />);
        // Wait for options to appear
        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "SGD" })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "USD" })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "EUR" })).toBeInTheDocument();
        });
    });

    it("shows the selected value", async () => {
        render(<CurrencyDropdown currency="EUR" setCurrency={setCurrency} />);
        await waitFor(() => {
            expect(screen.getByRole("combobox").value).toBe("EUR");
        });
    });

    it("calls setCurrency and updates localStorage on change", async () => {
        render(<CurrencyDropdown currency="USD" setCurrency={setCurrency} />);
        await screen.findByRole("combobox");
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "SGD" } });
        expect(setCurrency).toHaveBeenCalledWith("SGD");
        expect(localStorage.getItem("currency")).toBe("SGD");
    });

    it("renders with empty rates if API fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("fail"));
        render(<CurrencyDropdown currency="" setCurrency={setCurrency} />);
        await waitFor(() => {
            expect(screen.getByRole("combobox").children.length).toBe(0);
        });
    });

    it("renders without crashing if no props are passed", async () => {
        render(<CurrencyDropdown />);
        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeInTheDocument();
        });
    });

    it("is accessible by label", async () => {
        render(<CurrencyDropdown currency="USD" setCurrency={setCurrency} />);
        await waitFor(() => {
            expect(screen.getByLabelText(/select currency/i)).toBeInTheDocument();
        });
    });
});