import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ExistingBudget from "../component/ExistingBudget";
import axios from "axios";
import * as jwt from 'jwt-decode';
import '@testing-library/jest-dom';

// mock Bar chart, EditBudget, DeleteBudget
vi.mock('react-chartjs-2', () => ({
    Bar: () => <div>BarChartMock</div>
}));
vi.mock('../component/EditBudget', () => ({
    default: ({ onSave, onCancel }) => (
        <div>
            EditBudgetMock
            <button onClick={onSave}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    )
}));
vi.mock('../component/DeleteBudget', () => ({
    default: ({ onDeleteSuccess }) => (
        <button onClick={onDeleteSuccess}>DeleteBudgetMock</button>
    )
}));

const barProps = [];
vi.mock('react-chartjs-2', () => ({
    Bar: (props) => {
        barProps.push(props);
        return <div>BarChartMock</div>;
    }
}));

vi.mock("axios");

describe("ExistingBudget", () => {
    beforeEach(() => {
        localStorage.setItem("token", "fake-token");
        axios.get.mockReset();
        axios.get.mockImplementation(() => Promise.resolve({ data: [] }));
    });

    it("renders loading state initially", () => {
        render(<ExistingBudget />);
        expect(screen.getByText(/loading budgets/i)).toBeInTheDocument();
    });

    it("renders error if user not logged in", async () => {
        localStorage.removeItem("token");
        render(<ExistingBudget />);
        expect(await screen.findByText(/user not logged in/i)).toBeInTheDocument();
    });

    it("renders error if fetch fails", async () => {
        axios.get.mockRejectedValueOnce(new Error("fail"));
        render(<ExistingBudget />);
        expect(await screen.findByText(/failed to fetch budgets/i)).toBeInTheDocument();
    });

    it("renders budgets and chart", async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    _id: "1",
                    category: "Food",
                    currency: "SGD",
                    amountAllocated: 100,
                    amount: 60
                }
            ]
        });
        render(<ExistingBudget />);
        expect(await screen.findByText(/existing budgets/i)).toBeInTheDocument();
        expect(await screen.findByText(/food/i)).toBeInTheDocument();
        expect(screen.getByText(/allocated/i)).toBeInTheDocument();
        expect(screen.getByText(/remaining/i)).toBeInTheDocument();
        expect(screen.getByText("BarChartMock")).toBeInTheDocument();
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("DeleteBudgetMock")).toBeInTheDocument();
    });

    it("renders budgets and passes correct data to chart", async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    _id: "1",
                    category: "Food",
                    currency: "SGD",
                    amountAllocated: 100,
                    amount: 60
                }
            ]
        });
        render(<ExistingBudget />);
        expect(await screen.findByText(/food/i)).toBeInTheDocument();
        expect(screen.getByText("BarChartMock")).toBeInTheDocument();


        expect(barProps[0].data.datasets[0].data[0]).toBe(40); // spent = 100 - 60
        expect(barProps[0].data.datasets[1].data[0]).toBe(60); // remaining = 60
        expect(barProps[0].data.labels).toEqual(['']);
        expect(barProps[0].options.scales.x.max).toBe(100);
    });

    it("shows EditBudget when Edit is clicked", async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    _id: "1",
                    category: "Food",
                    currency: "SGD",
                    amountAllocated: 100,
                    amount: 60
                }
            ]
        });
        render(<ExistingBudget />);
        expect(await screen.findByText(/food/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText("Edit"));
        expect(await screen.findByText("EditBudgetMock")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Cancel"));
        expect(screen.queryByText("EditBudgetMock")).not.toBeInTheDocument();
    });

    it("shows DeleteBudget when Delete is clicked", async () => {
        axios.get.mockResolvedValueOnce({
            data: [
                {
                    id: "1",
                    _id: "1",
                    category: "Food",
                    currency: "SGD",
                    amountAllocated: 100,
                    amount: 60
                }
            ]
        });
        render(<ExistingBudget />);
        expect(await screen.findByText(/food/i)).toBeInTheDocument();
        const deleteButton = screen.getByText("DeleteBudgetMock");
        expect(deleteButton).toBeInTheDocument();
        fireEvent.click(deleteButton);
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    });

    it("refreshes budgets after edit or delete", async () => {
        axios.get.mockResolvedValue({
            data: [
                {
                    id: "1",
                    _id: "1",
                    category: "Food",
                    currency: "SGD",
                    amountAllocated: 100,
                    amount: 60
                }
            ]
        });
        render(<ExistingBudget />);
        expect(await screen.findByText(/food/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText("Edit"));
        fireEvent.click(screen.getByText("Save"));
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
        fireEvent.click(screen.getByText("DeleteBudgetMock"));
        await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(3));
    });
});