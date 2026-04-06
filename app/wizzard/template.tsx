import React from 'react'

interface LayoutWizardProps {
  children: React.ReactNode
}

export default function LayoutWizard({ children }: LayoutWizardProps) {
  return (
    <main>{children}</main>
  )
}
