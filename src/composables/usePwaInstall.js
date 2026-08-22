import { onMounted, ref } from 'vue'

export function usePwaInstall() {
  const canInstall = ref(false)
  const isIos = ref(false)
  let deferredPrompt = null

  onMounted(() => {
    const ua = navigator.userAgent
    isIos.value =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      canInstall.value = false
      deferredPrompt = null
    })
  })

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    deferredPrompt = null
    canInstall.value = false
  }

  return { canInstall, isIos, install }
}
