type frameConf = {
  name: string
  src: string
}
class Frame {
  name: string
  src: string
  dom: HTMLElement
  constructor(conf: frameConf) {
    this.name = conf.name
    this.src = conf.src
    this.dom = this.createPlaceholder()
  }
  createdom(tag: string): HTMLElement {
    const dom = document.createElement(tag)
    ;['frame', this.name].map(e => dom.classList.add(e))
    dom.style.gridArea = this.name
    return dom
  }
  createPlaceholder() {
    const iframe = this.createdom('div')
    iframe.innerHTML = `Wait loading...<br/>Please click Load button!!`
    return iframe
  }
  load() {
    if (this.dom.tagName === 'IFRAME') {
      return
    }
    const iframe = this.createdom('iframe') as HTMLIFrameElement
    iframe.src = this.src
    this.dom.outerHTML = iframe.outerHTML
    this.dom = iframe
  }
  unload() {
    if (this.dom.tagName !== 'IFRAME') {
      return
    }
    document.querySelector(`iframe.${this.name}`)!.remove()
    this.dom = this.createPlaceholder()
  }
}

type pageConf = {
  title: string
  name: string
  columns: string
  areas: string[]
  frames: frameConf[]
}
class Page {
  frames: Frame[]
  title: string
  name: string
  dom: HTMLElement
  constructor(conf: pageConf) {
    this.frames = []
    this.title = conf.title
    this.name = conf.name
    this.dom = this.createPage(conf.columns, `"${conf.areas.join('" "')}"`)
  }
  createPage(columns: string, areas: string) {
    const page = document.createElement('div')
    page.id = this.name
    page.classList.add('page')
    page.style.gridTemplateColumns = columns
    page.style.gridTemplateAreas = areas
    return page
  }
  addFrame(frame: Frame) {
    this.frames.push(frame)
    this.dom.appendChild(frame.dom)
  }
  loadFrames() {
    this.frames.map(e => e.load())
  }
  unloadFrames() {
    const page = this
    this.frames.map(e => {
      e.unload()
      page.dom.appendChild(e.dom)
    })
  }
  hide() {
    this.dom.style.display = 'none'
  }
  show() {
    this.dom.style.display = 'grid'
  }
}

class Tab {
  pages: { [key: string]: Page }
  currentPage: string
  dom: HTMLElement
  constructor() {
    this.pages = {}
    this.currentPage = ''
    this.dom = this.createTab()
    this.addLoad()
    this.addUnLoad()
  }
  createTab() {
    const tab = document.createElement('div')
    tab.classList.add('tab')
    return tab
  }
  addLoad() {
    const link = document.createElement('a')
    link.href = `#`
    link.onclick = () => this.loadCurrentPage()
    link.innerText = 'load'
    this.addLink(link)
  }
  addUnLoad() {
    const link = document.createElement('a')
    link.href = `#`
    link.onclick = () => this.unloadCurrentPage()
    link.innerText = 'unload'
    this.addLink(link)
  }
  addPage(page: Page) {
    this.pages[page.name] = page
    const link = document.createElement('a')
    link.href = `#${page.name}`
    link.onclick = () => this.switchpage(page.name)
    link.innerText = page.title
    this.addLink(link)
    document.body.appendChild(page.dom)
  }
  addLink(anchor: HTMLAnchorElement) {
    this.dom.appendChild(anchor)
  }
  switchpage(id: string) {
    this.currentPage = id
    this.tabActivate(id)
    this.#pages()
      .filter(e => e.name !== id)
      .map(e => e.hide())
    this.pages[id].show()
    this.loadCurrentPage()
    return false
  }
  tabActivate(id: string) {
    ;[...this.dom.querySelectorAll('a')].map(e => e.classList.remove('active'))
    this.dom.querySelector(`a[href="#${id}"]`)!.classList.add('active')
  }
  loadCurrentPage() {
    this.pages[this.currentPage].loadFrames()
  }
  unloadCurrentPage() {
    this.pages[this.currentPage].unloadFrames()
  }
  mount(target: HTMLElement) {
    target.appendChild(this.dom)
  }
  #pages() {
    return Object.keys(this.pages).map(e => this.pages[e])
  }
}

class Config {
  pages: pageConf[]
  constructor() {
    this.pages = []
  }
  async loadConfig(confpath: string) {
    const json = await fetch(confpath)
    const pages = await json.json()
    return pages
  }
}

class App {
  tab: Tab
  confpath: string
  pages: Config
  constructor(path: string) {
    this.tab = new Tab()
    this.confpath = path
    this.pages = new Config()
  }
  async loadConfig() {
    return this.pages.loadConfig(this.confpath)
  }
  importPages(pages: Config) {
    pages.pages.map(p => {
      const page = new Page(p)
      this.tab.addPage(page)
      p.frames.map(f => page.addFrame(new Frame(f)))
    })
  }
  start(target: HTMLElement) {
    this.tab.mount(target)
    this.importPages(this.pages)
    this.tab.switchpage(this.pages.pages[0].name)
  }
}

window.onload = async () => {
  const app = new App('pages.json')
  app.pages = await app.loadConfig()
  app.start(document.body)
}
