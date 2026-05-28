import { StoreProvider } from './StoreProvider'
import { AlgorithmBar } from './ui/AlgorithmBar'
import { Feed } from './ui/Feed'
import { WhileYouWereOut } from './ui/WhileYouWereOut'
import { AchievementToast } from './ui/AchievementToast'
import { Footer } from './ui/Footer'

export function Game() {
  return (
    <StoreProvider>
      <div className="min-h-svh">
        <AlgorithmBar />
        <Feed />
        <Footer />
        <AchievementToast />
        <WhileYouWereOut />
      </div>
    </StoreProvider>
  )
}
