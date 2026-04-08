'use client'

import dynamic from 'next/dynamic'

const ChatWidget = dynamic(() => import('../components/ChatWidget'), { ssr: false })

export default function Home() {
  return (
    <>
      <iframe
        src="/pfo-map.html"
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
        title="Карта лёгкой промышленности ПФО"
      />
      <ChatWidget />
    </>
  )
}
