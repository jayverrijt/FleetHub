import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StopList from '../StopList';

describe('StopList Component Unit Tests (US5a & US5b)', () => {
    const sampleStops = [
        {
            id: 1,
            sequenceOrder: 1,
            status: 'PENDING',
            recipientName: 'Klant Een',
            orderNumber: 'ORD-001',
            address: 'Kerkstraat 1',
            city: 'Eindhoven'
        },
        {
            id: 2,
            sequenceOrder: 2,
            status: 'DELIVERED',
            recipientName: 'Klant Twee',
            orderNumber: 'ORD-002',
            address: 'Markt 2',
            city: 'Eindhoven'
        }
    ];

    it('UT-STOPLIST-01: Rendert empty-state wanneer stops leeg is', () => {
        render(<StopList stops={[]} onStatusUpdate={vi.fn()} />);

        expect(
            screen.getByText('Er zijn momenteel geen actieve stops toegewezen aan deze rit.')
        ).toBeDefined();
    });

    it('UT-STOPLIST-02: Rendert empty-state wanneer stops undefined of null is', () => {
        render(<StopList stops={null} onStatusUpdate={vi.fn()} />);

        expect(
            screen.getByText('Er zijn momenteel geen actieve stops toegewezen aan deze rit.')
        ).toBeDefined();
    });

    it('UT-STOPLIST-03: Rendert een lijst van StopCards met juiste updating-status', () => {
        const handleStatusUpdate = vi.fn();

        render(
            <StopList
                stops={sampleStops}
                onStatusUpdate={handleStatusUpdate}
                updatingId={1}
            />
        );

        expect(screen.getByText('Klant Een')).toBeDefined();
        expect(screen.getByText('Klant Twee')).toBeDefined();

        // Stop #1 moet uitgeschakeld zijn via disabled property
        const geleverdBtn = screen.getByRole('button', { name: /Geleverd/i });
        expect(geleverdBtn.disabled).toBe(true);

        // Stop #2 is al DELIVERED en toont "Afgehandeld"
        expect(screen.getByText('Afgehandeld')).toBeDefined();
    });
});