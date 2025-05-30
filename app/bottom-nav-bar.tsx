import { getProfileById, getUser } from '@/db/profile'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { NavBarItem } from './bottom-nav-bar-item'
import Link from 'next/link'
import { Avatar } from '@/components/avatar'
import { Col } from '@/components/layout/col'
import { calculateCharityBalance, calculateUserBalance } from '@/utils/math'
import { getTxnsByUser } from '@/db/txn'
import { getPendingBidsByUser } from '@/db/bid'
import { formatMoney } from '@/utils/formatting'

export const BOTTOM_NAV_BAR_HEIGHT = 58

export type Item = {
  name: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

export async function BottomNavBar() {
  const supabase = await createServerSupabaseClient()
  const user = await getUser(supabase)
  const profile = await getProfileById(supabase, user?.id)
  const txns = await getTxnsByUser(supabase, user?.id ?? '')
  const bids = await getPendingBidsByUser(supabase, user?.id ?? '')
  const navigationOptions = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'People', href: '/people' },
    { name: 'Categories', href: '/causes' },
    {
      name: user ? 'Profile' : 'Login',
      href: user ? `/${profile?.username}` : '/login',
    },
    {
      name: 'Create',
      href: profile?.regranter_status ? '/create-grant' : '/create',
    },
  ]
  const navOptionsDisplay = navigationOptions.map((item) => {
    if (item.name === 'Profile' && !!profile) {
      return (
        <Link
          key={item.name}
          href={item.href ?? '#'}
          className="block w-full px-3 py-1 text-center transition-colors sm:hover:bg-gray-200 sm:hover:text-orange-600"
        >
          <Col>
            <div className="mx-auto my-1">
              <Avatar
                size={6}
                username={profile.username}
                avatarUrl={profile.avatar_url}
                id={profile.id}
                noLink
              />
            </div>
            <p className="text-center">
              {formatMoney(
                calculateCharityBalance(
                  txns,
                  bids,
                  profile.id,
                  profile.accreditation_status
                )
              )}
            </p>
          </Col>
        </Link>
      )
    } else {
      return <NavBarItem key={item.name} item={item} />
    }
  })
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex select-none items-center justify-between border-t-2 bg-white text-xs text-gray-700 lg:hidden print:hidden">
      {navOptionsDisplay}
    </nav>
  )
}
