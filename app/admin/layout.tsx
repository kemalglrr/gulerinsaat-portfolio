import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel | Güler Yapı Proje",
  description: "Admin yönetim paneli",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

