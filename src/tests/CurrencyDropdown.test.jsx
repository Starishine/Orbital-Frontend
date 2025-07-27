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
        EUR: 0.85,
    };
    const setCurrency = vi.fn();

    beforeEach(() => {
        setCurrency.mockClear();
        axios.get.mockReset(); // reset any previous mock implementations
        axios.get.mockResolvedValue({ data: { rates: mockRates } });
        localStorage.clear();
    });

    it("loads and displays currency options from the API", async () => { // apparently can phrase this as fetches and renders currency options from API
        render(<CurrencyDropdown currency="USD" setCurrency={setCurrency} />);
        // wait for options to appear
        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeInTheDocument(); // combobox - selects the dropdown element for currencies in your test
            expect(screen.getByRole("option", { name: "SGD" })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "USD" })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "EUR" })).toBeInTheDocument();
        });
    });

    it("shows the currently selected currency", async () => {
        render(<CurrencyDropdown currency="EUR" setCurrency={setCurrency} />); 
        await waitFor(() => {
            expect(screen.getByRole("combobox").value).toBe("EUR"); // 
        });
    });

    it("updates setCurrency and localStorage when user selects a new currency", async () => {
        render(<CurrencyDropdown currency="USD" setCurrency={setCurrency} />);
        await screen.findByRole("combobox");
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "SGD" } });
        expect(setCurrency).toHaveBeenCalledWith("SGD");
        expect(localStorage.getItem("currency")).toBe("SGD");
    });

    it("is displayed with empty rates if API fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("fail"));
        render(<CurrencyDropdown currency="" setCurrency={setCurrency} />);
        await waitFor(() => {
            expect(screen.getByRole("combobox").children.length).toBe(0);
        });
    });

    it("is displayed without crashing if no props are passed", async () => {
        render(<CurrencyDropdown />);
        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeInTheDocument();
        });
    });

});