import { createContext, useContext } from 'react'

// Shared between AdminLayout (provider) and admin pages (via useAdminPage).
// Lives in its own file so AdminLayout can satisfy React Fast Refresh's
// "only export components" rule.
export const AdminUIContext = createContext({
  setHeader: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  unreadInquiries: 0,
  bumpInquiryUnread: () => {},
})

export function useAdminUI() {
  return useContext(AdminUIContext)
}
