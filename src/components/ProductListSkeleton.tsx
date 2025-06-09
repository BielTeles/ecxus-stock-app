'use client'

import { Filter } from 'lucide-react'

export default function ProductListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-300" />
              <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow animate-pulse">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="h-6 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 bg-gray-300 rounded-full w-1/3"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((btnIndex) => (
                      <div key={btnIndex} className="h-8 w-8 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 