import { getAllMiniProfiles } from '@/db/profile'
import { CreateGrantForm } from './create-grant-form'
import { createServerSupabaseClient } from '@/db/supabase-server'
import { getUser } from '@/db/profile'
import { getProfileById } from '@/db/profile'
import { getTxnAndProjectsByUser } from '@/db/txn'
import { getBidsByUser } from '@/db/bid'
import Link from 'next/link'
import { calculateCharityBalance } from '@/utils/math'
import { listSimpleCauses } from '@/db/cause'

export const revalidate = 60
export default async function CreateGrantPage() {
  const supabase = await createServerSupabaseClient()
  const profiles = (await getAllMiniProfiles(supabase)).filter(
    (profile) => profile.type === 'individual' && profile.full_name.length > 0
  )
  const user = await getUser(supabase)
  if (!user) {
    return (
      <div>
        <Link href="/login" className="text-orange-500 hover:text-orange-600">
          Log in
        </Link>{' '}
        to give grants!
      </div>
    )
  }
  const [profile, txns, bids, causesList] = await Promise.all([
    getProfileById(supabase, user.id),
    getTxnAndProjectsByUser(supabase, user.id),
    getBidsByUser(supabase, user.id),
    listSimpleCauses(supabase),
  ])
  if (!profile?.regranter_status) {
    return (
      <div>
        You must be a regranter to give grants.{' '}
        <Link href="/profile" className="text-orange-500 hover:text-orange-600">
          Apply to be a regranter
        </Link>
        .
      </div>
    )
  }
  const regranterCharityBalance = calculateCharityBalance(
    txns,
    bids,
    profile.id,
    profile.accreditation_status
  )
  return (
    <CreateGrantForm
      profiles={profiles}
      causesList={causesList}
      maxDonation={regranterCharityBalance}
    />
  )
}
