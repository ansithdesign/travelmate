import { useEffect } from 'react'
import { BrowserRouter, MemoryRouter, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AppShell } from './components/navigation/AppShell'
import { ExpenseSheet } from './components/expenses/ExpenseSheet'
import { TripFormSheet } from './components/trips/TripFormSheet'
import { ToastProvider, useToast } from './components/ui/Toast'
import { Details } from './pages/Details'
import { Expenses } from './pages/Expenses'
import { Home } from './pages/Home'
import { Journal } from './pages/Journal'
import { NotFound } from './pages/NotFound'
import { People } from './pages/People'
import { Profile } from './pages/Profile'
import { Settle } from './pages/Settle'
import { TripExpenses } from './pages/TripExpenses'
import { TripOverview } from './pages/TripOverview'
import { StoreProvider, useStore } from './store/store'
import { UIProvider } from './store/ui'
import { SkyProvider } from './store/sky'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/** Invite links resolve locally: /join/CODE opens that trip's people page. */
function Join() {
  const { code } = useParams()
  const { data } = useStore()
  const trip = data.trips.find((t) => t.inviteCode === code)
  return trip ? <Navigate to={`/trips/${trip.id}/people`} replace /> : <NotFound />
}

function Stores({ children }: { children: React.ReactNode }) {
  const toast = useToast()
  return <StoreProvider onSaveError={toast.error}>{children}</StoreProvider>
}

// The in-chat preview runs inside a sandboxed frame, so it keeps navigation in memory.
const Router = import.meta.env.VITE_PREVIEW ? MemoryRouter : BrowserRouter

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <SkyProvider>
      <ToastProvider>
        <Stores>
          <UIProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Home />} />
                <Route path="trips/:tripId" element={<TripOverview />} />
                <Route path="trips/:tripId/expenses" element={<TripExpenses />} />
                <Route path="trips/:tripId/settle" element={<Settle />} />
                <Route path="trips/:tripId/people" element={<People />} />
                <Route path="trips/:tripId/details" element={<Details />} />
                <Route path="trips/:tripId/journal" element={<Journal />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="profile" element={<Profile />} />
                <Route path="join/:code" element={<Join />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <ExpenseSheet />
            <TripFormSheet />
          </UIProvider>
        </Stores>
      </ToastProvider>
      </SkyProvider>
    </Router>
  )
}
