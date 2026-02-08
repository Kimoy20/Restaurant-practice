import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Login page — design inspired by code-server login:
 * Centered, minimal layout with single heading, instruction, and password form.
 */
export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Simple gate: redirect to kitchen on any submit (design-only)
    if (password.trim()) {
      navigate('/kitchen', { replace: true })
      return
    }
    setError('Please enter the password.')
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Heading — same structure as code-server */}
        <h1 className="text-2xl font-semibold text-[#e5e5e5] text-center mb-2">
          Welcome to Siaro Kaw Kitchen
        </h1>
        <p className="text-[#9ca3af] text-sm text-center mb-8">
          Please log in below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" colonial className="block text-sm font-medium text-[#d1d5db] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg bg-[#2d2d2d] border border-[#404040] text-[#e5e5e5] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#28a593] focus:border-transparent"
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[#f87171] text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-lg bg-[#28a593] hover:bg-[#1d8578] text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#28a593] focus:ring-offset-2 focus:ring-offset-[#1e1e1e] transition-colors"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-[#6b7280] text-xs">
          Siargao · Siaro Kaw
        </p>
      </div>
    </div>
  )
}