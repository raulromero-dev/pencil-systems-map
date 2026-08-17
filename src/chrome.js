// The page furniture, and there is very little of it: a masthead, and a switch
// between the two grounds. The detail panel is gone, so the map has to carry
// its whole argument on its face.
import { h, s, iconPaper, iconGraphite, constructionMark } from './svg.js'
import { get, set, subscribe } from './state.js'

export function buildChrome(root) {
  const st = get()

  const header = h('header', {}, [
    h('div', { class: 'mark' }, [
      constructionMark(),
      h('h1', {}, [
        document.createTextNode("The Pencil's "),
        h('span', { text: 'influence on visual communication' }),
      ]),
    ]),
  ])

  const modeSwitch = h('div', { class: 'seg', role: 'group', 'aria-label': 'Ground' }, [
    h('button', { type: 'button', id: 'tg-paper', 'aria-pressed': String(st.mode === 'paper'),
      'aria-label': 'Paper', title: 'Paper', onclick: () => set({ mode: 'paper' }) }, [iconPaper()]),
    h('button', { type: 'button', id: 'tg-graphite', 'aria-pressed': String(st.mode === 'graphite'),
      'aria-label': 'Graphite', title: 'Graphite', onclick: () => set({ mode: 'graphite' }) }, [iconGraphite()]),
  ])

  const svg = s('svg', { id: 'canvas', preserveAspectRatio: 'xMidYMin meet',
    viewBox: '0 0 1600 2000' })
  const stage = h('main', { class: 'stage' }, [svg])

  const footer = h('footer', {}, [
    h('div', { class: 'legend' }),
    h('div', { class: 'right' }, [modeSwitch]),
  ])

  root.append(header, stage, footer)

  subscribe(state => {
    document.documentElement.dataset.mode = state.mode
    document.getElementById('tg-paper').setAttribute('aria-pressed', String(state.mode === 'paper'))
    document.getElementById('tg-graphite').setAttribute('aria-pressed', String(state.mode === 'graphite'))
  })
  document.documentElement.dataset.mode = st.mode

  return { svg }
}
