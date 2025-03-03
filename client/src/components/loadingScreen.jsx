import React, { useState } from 'react'

export default function LoadingScreen() {

  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  return (
    <>
      {!completed ? (
        <>
          {!loading ? (
            <div className="spinner">
              <span>Loading...</span>
              <div className="half-spinner"></div>
            </div>
          ) : (
            <div className="completed">&#x2713;</div>
          )}
        </>
      ) : (
        <>
        </>
      )}
    </>
  );
}