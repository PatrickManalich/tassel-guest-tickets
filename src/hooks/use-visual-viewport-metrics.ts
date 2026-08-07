import { useEffect, useState } from "react"

interface VisualViewportMetrics {
  /** Height of the actually-visible viewport — shrinks when the on-screen keyboard opens. */
  height: number
  /** Vertical scroll offset of the visible viewport within the layout viewport. */
  offsetTop: number
}

function readMetrics(): VisualViewportMetrics {
  const vv = typeof window !== "undefined" ? window.visualViewport : null
  if (!vv) {
    return { height: typeof window !== "undefined" ? window.innerHeight : 0, offsetTop: 0 }
  }
  return { height: vv.height, offsetTop: vv.offsetTop }
}

// The dvh CSS unit + interactive-widget=resizes-content meta tag were meant
// to handle this, but that turned out not to be enough on an actual device
// with the keyboard genuinely open (confirmed: Save/Cancel pushed off-screen
// in the Add/Reassign dialog). The VisualViewport API reports the real
// visible height directly, independent of which CSS features a given
// browser/OS combination happens to support.
export function useVisualViewportMetrics(): VisualViewportMetrics {
  const [metrics, setMetrics] = useState<VisualViewportMetrics>(readMetrics)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function update() {
      setMetrics(readMetrics())
    }

    update()
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  return metrics
}
