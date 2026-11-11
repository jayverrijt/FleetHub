import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StopCard from '../StopCard';

describe('StopCard Component Unit Tests (US5b)', () => {
    const pendingStop = {
        id: 10,
        sequenceOrder: 1,
        status: 'PENDING',
        recipientName: 'Jan de Vries',
        orderNumber: 'ORD-1001',
        address: 'Rachelsmolen 1',
        city: 'Eindhoven'
    };

    const deliveredStop = {
        ...pendingStop,
        id: 11,
        sequenceOrder: 2,
        status: 'DELIVERED'
    };

    const failedStop = {
        ...pendingStop,
        id: 12,
        sequenceOrder: 3,
        status: 'FAILED_NOT_HOME'
    };

    it('UT-STOPCARD-01: Rendert stopdetails en actieknoppen voor een openstaande stop', () => {
        const handleStatusUpdate = vi.fn();

        render(
            <StopCard
                stop={pendingStop}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={false}
            />
        );

        expect(screen.getByText('Stop #1')).toBeDefined();
        expect(screen.getByText('PENDING')).toBeDefined();
        expect(screen.getByText('Jan de Vries')).toBeDefined();
        expect(screen.getByText('ORD-1001')).toBeDefined();
        expect(screen.getByText(/Rachelsmolen 1, Eindhoven/i)).toBeDefined();

        const deliveredBtn = screen.getByRole('button', { name: /Geleverd/i });
        const failedBtn = screen.getByRole('button', { name: /Niet Thuis/i });

        expect(deliveredBtn).toBeDefined();
        expect(failedBtn).toBeDefined();
        expect(deliveredBtn.disabled).toBe(false);
        expect(failedBtn.disabled).toBe(false);
    });

    it('UT-STOPCARD-02: Vuurt onStatusUpdate aan met DELIVERED bij klik op Geleverd', () => {
        const handleStatusUpdate = vi.fn();

        render(
            <StopCard
                stop={pendingStop}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={false}
            />
        );

        const deliveredBtn = screen.getByRole('button', { name: /Geleverd/i });
        fireEvent.click(deliveredBtn);

        expect(handleStatusUpdate).toHaveBeenCalledTimes(1);
        expect(handleStatusUpdate).toHaveBeenCalledWith(10, 'DELIVERED');
    });

    it('UT-STOPCARD-03: Vuurt onStatusUpdate aan met FAILED_NOT_HOME bij klik op Niet Thuis', () => {
        const handleStatusUpdate = vi.fn();

        render(
            <StopCard
                stop={pendingStop}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={false}
            />
        );

        const failedBtn = screen.getByRole('button', { name: /Niet Thuis/i });
        fireEvent.click(failedBtn);

        expect(handleStatusUpdate).toHaveBeenCalledTimes(1);
        expect(handleStatusUpdate).toHaveBeenCalledWith(10, 'FAILED_NOT_HOME');
    });

    it('UT-STOPCARD-04: Schakelt knoppen uit wanneer isUpdating true is', () => {
        render(
            <StopCard
                stop={pendingStop}
                onStatusUpdate={vi.fn()}
                isUpdating={true}
            />
        );

        expect(screen.getByRole('button', { name: /Geleverd/i }).disabled).toBe(true);
        expect(screen.getByRole('button', { name: /Niet Thuis/i }).disabled).toBe(true);
    });

    it('UT-STOPCARD-05: Toont completion-label en verbergt knoppen bij DELIVERED status', () => {
        const { container } = render(
            <StopCard
                stop={deliveredStop}
                onStatusUpdate={vi.fn()}
                isUpdating={false}
            />
        );

        expect(screen.getByText('Afgehandeld')).toBeDefined();
        expect(screen.queryByRole('button', { name: /Geleverd/i })).toBeNull();
        expect(screen.queryByRole('button', { name: /Niet Thuis/i })).toBeNull();
        expect(container.firstChild.classList.contains('completed')).toBe(true);
    });

    it('UT-STOPCARD-06: Toont completion-label en verbergt knoppen bij FAILED_NOT_HOME status', () => {
        const { container } = render(
            <StopCard
                stop={failedStop}
                onStatusUpdate={vi.fn()}
                isUpdating={false}
            />
        );

        expect(screen.getByText('Afgehandeld')).toBeDefined();
        expect(screen.queryByRole('button', { name: /Geleverd/i })).toBeNull();
        expect(container.firstChild.classList.contains('completed')).toBe(true);
    });
});