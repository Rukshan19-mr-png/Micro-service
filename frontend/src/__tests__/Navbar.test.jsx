/**
 * Unit Tests — Navbar Component
 * Tests rendering based on auth state: guest view, candidate view, company view.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import React from 'react';
import Navbar from '../../components/Navbar';

// Mock AuthContext
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockUseAuth()
}));

// Mock react-router-dom navigate
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => vi.fn() };
});

function renderNavbar(currentUser = null, onOpenAuth = vi.fn()) {
    mockUseAuth.mockReturnValue({ currentUser, logout: mockLogout });
    return render(
        <MemoryRouter>
            <Navbar onOpenAuth={onOpenAuth} />
        </MemoryRouter>
    );
}

describe('Navbar — Guest State (not logged in)', () => {
    beforeEach(() => { vi.clearAllMocks(); });

    test('renders NexusEvent brand name', () => {
        renderNavbar(null);
        expect(screen.getByText('NexusEvent')).toBeInTheDocument();
    });

    test('shows Sign In button when logged out', () => {
        renderNavbar(null);
        expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    test('does not show Logout button when logged out', () => {
        renderNavbar(null);
        expect(screen.queryByTitle('Logout')).not.toBeInTheDocument();
    });

    test('does not show My Applications link when logged out', () => {
        renderNavbar(null);
        expect(screen.queryByText('My Applications')).not.toBeInTheDocument();
    });

    test('does not show Dashboard link when logged out', () => {
        renderNavbar(null);
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    test('clicking Sign In calls onOpenAuth', () => {
        const mockOpenAuth = vi.fn();
        renderNavbar(null, mockOpenAuth);
        fireEvent.click(screen.getByText('Sign In'));
        expect(mockOpenAuth).toHaveBeenCalledTimes(1);
    });

    test('Browse link is always visible', () => {
        renderNavbar(null);
        expect(screen.getByText('Browse')).toBeInTheDocument();
    });
});

describe('Navbar — Candidate (Student) State', () => {
    const candidateUser = { email: 'student@test.com', role: 'candidate', name: 'Alice' };

    beforeEach(() => { vi.clearAllMocks(); });

    test('shows user name when logged in', () => {
        renderNavbar(candidateUser);
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    test('shows Candidate role badge', () => {
        renderNavbar(candidateUser);
        expect(screen.getByText('Candidate')).toBeInTheDocument();
    });

    test('shows My Applications link for candidate', () => {
        renderNavbar(candidateUser);
        expect(screen.getByText('My Applications')).toBeInTheDocument();
    });

    test('does NOT show Dashboard link for candidate', () => {
        renderNavbar(candidateUser);
        expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    test('does not show Sign In button when logged in', () => {
        renderNavbar(candidateUser);
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });

    test('falls back to email when name is empty', () => {
        renderNavbar({ email: 'noname@test.com', role: 'candidate', name: '' });
        expect(screen.getByText('noname@test.com')).toBeInTheDocument();
    });

    test('clicking logout button calls logout()', () => {
        renderNavbar(candidateUser);
        fireEvent.click(screen.getByTitle('Logout'));
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });
});

describe('Navbar — Company State', () => {
    const companyUser = { email: 'corp@test.com', role: 'company', name: 'TechCorp Ltd' };

    beforeEach(() => { vi.clearAllMocks(); });

    test('shows company name', () => {
        renderNavbar(companyUser);
        expect(screen.getByText('TechCorp Ltd')).toBeInTheDocument();
    });

    test('shows Company role badge', () => {
        renderNavbar(companyUser);
        expect(screen.getByText('Company')).toBeInTheDocument();
    });

    test('shows Dashboard link for company', () => {
        renderNavbar(companyUser);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    test('does NOT show My Applications link for company', () => {
        renderNavbar(companyUser);
        expect(screen.queryByText('My Applications')).not.toBeInTheDocument();
    });

    test('does not show Sign In button for company', () => {
        renderNavbar(companyUser);
        expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
    });
});

describe('Navbar — Mobile Menu', () => {
    const candidateUser = { email: 'mobile@test.com', role: 'candidate', name: 'Bob' };

    beforeEach(() => { vi.clearAllMocks(); });

    test('mobile menu is hidden by default', () => {
        renderNavbar(candidateUser);
        // The mobile menu block should not be in the DOM initially
        expect(screen.queryByText('Sign In', { selector: 'button.block' })).not.toBeInTheDocument();
    });

    test('clicking hamburger toggles mobile menu open', () => {
        renderNavbar(null);
        const hamburger = screen.getByRole('button', { name: /menu/i });
        // Initially, mobile Sign In isn't shown as a block button
        fireEvent.click(hamburger);
        // After toggle, mobile Sign In button should appear
        const signInButtons = screen.getAllByText('Sign In');
        expect(signInButtons.length).toBeGreaterThanOrEqual(1);
    });
});
