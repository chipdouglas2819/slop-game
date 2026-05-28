import { StoreProvider } from './StoreProvider'
import { AlgorithmBar } from './ui/AlgorithmBar'
import { Feed } from './ui/Feed'
import { WhileYouWereOut } from './ui/WhileYouWereOut'
import { AchievementToast } from './ui/AchievementToast'
import { Footer } from './ui/Footer'
import { Onboarding } from './ui/Onboarding'
import { ScandalResultToast } from './ui/ScandalResultToast'

export function Game() {
  return (
    <StoreProvider>
      <div className="min-h-svh">
        <AlgorithmBar />
        <Onboarding />
        <Feed />
        <Footer />
        <AchievementToast />
        <ScandalResultToast />
        <WhileYouWereOut />
      </div>
    </StoreProvider>
  )
}
