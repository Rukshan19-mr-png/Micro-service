/**
 * Unit Tests — AuthContext
 * Tests the React authentication context: login, logout, register, and authHeader.
 */

import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import React from 'react';

// Mock axios
vi.mock('axios');

// Helper component to expose auth context values
function AuthConsumer() {
    const { token, currentUser, login, logout, register, authHeader } = useAuth();
    return (
        <div>
            <span data-testid="token">{token || 'null'}</span>
            <span data-testid="role">{currentUser?.role || 'null'}</span>
            <span data-testid="email">{currentUser?.email || 'null'}</span>
            <button
                data-testid="login-btn"
                onClick={() => login('user@test.com', 'Password123!')}
            >Login</button>
            <button
                data-testid="logout-btn"
                onClick={() => logout()}
            >Logout</button>
            <button
                data-testid="register-btn"
                onClick={() => register({ email: 'new@test.com', password: 'Pass123!', role: 'student' })}
            >Register</button>
            <button
                data-testid="header-btn"
                onClick={() => {
                    const h = authHeader();
                    document.getElementById('header-out').textContent = JSON.stringify(h);
                }}
            >Header</button>
            <div id="header-out"></div>
        </div>
    );
}

function Wrapper({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext — Initial State', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    test('starts with null token and user when localStorage is empty', () => {
        render(<Wrapper><AuthConsumer /></Wrapper>);
        expect(screen.getByTestId('token').textContent).toBe('null');
        expect(screen.getByTestId('role').textContent).toBe('null');
    });

    test('restores token and user from localStorage on mount', () => {
        localStorage.setItem('token', 'saved_token');
        localStorage.setItem('user', JSON.stringify({ email: 'saved@test.com', role: 'candidate' }));
        render(<Wrapper><AuthConsumer /></Wrapper>);
        expect(screen.getByTestId('token').textContent).toBe('saved_token');
        expect(screen.getByTestId('role').textContent).toBe('candidate');
    });
});

describe('AuthContext — Login', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    test('login sets token and currentUser on success', async () => {
        axios.post.mockResolvedValueOnce({
            data: {
                token: 'jwt_abc123',
                user: { email: 'user@test.com', role: 'candidate' }
            }
        });

        render(<Wrapper><AuthConsumer /></Wrapper>);
        await act(async () => {
            screen.getByTestId('login-btn').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('token').textContent).toBe('jwt_abc123');
            expect(screen.getByTestId('role').textContent).toBe('candidate');
        });
    });

    test('login persists token to localStorage', async () => {
        axios.post.mockResolvedValueOnce({
            data: { token: 'persist_token', user: { email: 'x@y.com', role: 'candidate' } }
        });
        render(<Wrapper><AuthConsumer /></Wrapper>);
        await act(async () => { screen.getByTestId('login-btn').click(); });
        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('persist_token');
        });
    });

    test('login throws error on failed credentials', async () => {
        const mockError = { response: { data: { error: 'Invalid credentials' } } };
        axios.post.mockRejectedValueOnce(mockError);

        let caughtError = null;
        function LoginTester() {
            const { login } = useAuth();
            return (
                <button onClick={async () => {
                    try { await login('bad@test.com', 'wrongpass'); }
                    catch (e) { caughtError = e; }
                }}>Try Login</button>
            );
        }
        render(<Wrapper><LoginTester /></Wrapper>);
        await act(async () => { screen.getByText('Try Login').click(); });
        expect(caughtError).not.toBeNull();
        expect(caughtError.message).toBe('Invalid credentials');
    });
});

describe('AuthContext — Logout', () => {
    beforeEach(() => {
        localStorage.setItem('token', 'existing_token');
        localStorage.setItem('user', JSON.stringify({ email: 'u@v.com', role: 'candidate' }));
        vi.clearAllMocks();
    });

    test('logout clears token and currentUser', async () => {
        render(<Wrapper><AuthConsumer /></Wrapper>);
        expect(screen.getByTestId('token').textContent).toBe('existing_token');

        await act(async () => { screen.getByTestId('logout-btn').click(); });
        expect(screen.getByTestId('token').textContent).toBe('null');
        expect(screen.getByTestId('role').textContent).toBe('null');
    });

    test('logout removes items from localStorage', async () => {
        render(<Wrapper><AuthConsumer /></Wrapper>);
        await act(async () => { screen.getByTestId('logout-btn').click(); });
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
});

describe('AuthContext — Register', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    test('register calls POST /api/auth/register', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'User registered successfully', user: { role: 'candidate' } } });
        render(<Wrapper><AuthConsumer /></Wrapper>);
        await act(async () => { screen.getByTestId('register-btn').click(); });
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/register'),
            expect.objectContaining({ email: 'new@test.com' })
        );
    });

    test('register throws error on duplicate email', async () => {
        const mockError = { response: { data: { error: 'Email already exists' } } };
        axios.post.mockRejectedValueOnce(mockError);

        let caughtError = null;
        function RegisterTester() {
            const { register } = useAuth();
            return (
                <button onClick={async () => {
                    try { await register({ email: 'dup@test.com', password: 'Pass123!', role: 'student' }); }
                    catch (e) { caughtError = e; }
                }}>Try Register</button>
            );
        }
        render(<Wrapper><RegisterTester /></Wrapper>);
        await act(async () => { screen.getByText('Try Register').click(); });
        expect(caughtError?.message).toBe('Email already exists');
    });
});

describe('AuthContext — authHeader()', () => {
    beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

    test('returns empty object when no token', () => {
        let header = null;
        function HeaderTester() {
            const { authHeader } = useAuth();
            header = authHeader();
            return null;
        }
        render(<Wrapper><HeaderTester /></Wrapper>);
        expect(header).toEqual({});
    });

    test('returns Authorization header when token exists', async () => {
        axios.post.mockResolvedValueOnce({
            data: { token: 'bearer_xyz', user: { email: 'h@t.com', role: 'candidate' } }
        });

        let header = null;
        function HeaderTester() {
            const { login, authHeader } = useAuth();
            return (
                <button onClick={async () => {
                    await login('h@t.com', 'pass');
                    header = authHeader();
                }}>Get Header</button>
            );
        }
        render(<Wrapper><HeaderTester /></Wrapper>);
        await act(async () => { screen.getByText('Get Header').click(); });
        await waitFor(() => {
            expect(header).toEqual({ headers: { authorization: 'Bearer bearer_xyz' } });
        });
    });
});
