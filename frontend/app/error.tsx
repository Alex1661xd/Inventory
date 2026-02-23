'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold">Algo salió mal</h2>
        <p className="text-sm text-gray-600">
          Ocurrió un error inesperado. Puedes intentar nuevamente.
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-md bg-black text-white text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
