'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

export const SearchUsers = () => {
  const router = useRouter()
  const pathname = usePathname()
  const [searchTerm, setSearchTerm] = useState('')

  // Extract search term from URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const query = params.get('search')
    if (query) {
      setSearchTerm(query)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`${pathname}?search=${encodeURIComponent(searchTerm.trim())}`)
    } else {
      router.push(pathname)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex items-center">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="search"
            name="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 block w-full rounded-md border-0 py-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
          />
        </div>
        <button
          type="submit"
          className="ml-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2.5 text-sm font-medium shadow-sm transition-colors"
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('')
              router.push(pathname)
            }}
            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear
          </button>
        )}
      </form>
    </div>
  )
}