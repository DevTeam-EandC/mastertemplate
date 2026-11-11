
import { useEffect, useState } from 'react'

function App() {
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/connection/status')
            .then(response => {
                if (!response.ok) {
                    throw new Error('API connection failed')
                }

                return response.json()
            })
            .then(data => {
                setStatus(data)
                setError('')
            })
            .catch(error => {
                setError(error.message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const StatusItem = ({ title, value }) => (
        <div className="flex justify-between items-center border-b py-4">
            <span className="font-medium">{title}</span>

            <span className={
                value === 'Connected'
                    ? 'text-green-600 font-semibold'
                    : 'text-red-600 font-semibold'
            }>
                {value}
            </span>
        </div>
    )

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8">

                <h1 className="text-2xl font-bold mb-2">
                    CompanyApp
                </h1>

                <p className="text-gray-500 mb-6">
                    System Connection Status
                </p>

                {loading ? (
                    <p>Checking connections...</p>
                ) : error ? (
                    <p className="text-red-600">{error}</p>
                ) : (
                    <>
                        <StatusItem
                            title="ASP.NET Core API"
                            value={status.api}
                        />

                        <StatusItem
                            title="PostgreSQL Database"
                            value={status.database}
                        />

                        <StatusItem
                            title="Database Name"
                            value={status.databaseName || 'Unavailable'}
                        />
                    </>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                >
                    Refresh Status
                </button>

            </div>
        </main>
    )
}

export default App
