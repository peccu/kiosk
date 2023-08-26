type frameConf = {
  name: string,
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
    const dom = document.createElement(tag);
    ['frame', this.name].map(e => dom.classList.add(e))
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
}
class Page {
  constructor({title, name, columns, areas}){
    this.frames = []
    this.title = title
    this.name = name
    this.dom = this.createPage(columns, areas.join(' '))
  }
  createPage(columns, areas){
    const page = document.createElement('div')
    page.id = this.name
    page.classList.add('page')
    page.style.gridTemplateColumns = columns
    page.style.gridTemplateAreas = areas
    return page
  }
  addFrame(frame){
    this.frames.push(frame)
    this.dom.appendChild(frame.dom)
  }
  loadFrames(){
    this.frames.map(e=>e.load())
  }
  hide(){
    this.dom.style.display = 'none'
  }
  show(){
    this.dom.style.display = 'grid'
  }
}
class Tab {
  constructor(){
    this.pages = {}
    this.currentPage = ''
    this.dom = this.createTab()
    this.addLoad()
  }
  createTab(){
    const tab = document.createElement('div')
    tab.classList.add('tab')
    return tab
  }
  addLoad(){
    const link = document.createElement('a')
    link.href = `#`
    link.onclick = () => this.loadCurrentPage()
    link.innerText = 'load'
    this.addLink(link)
  }
  addPage(page){
    this.pages[page.name] = page
    const link = document.createElement('a')
    link.href = `#${page.name}`
    link.onclick = () => this.switchpage(page.name)
    link.innerText = page.title
    this.addLink(link)
    document.body.appendChild(page.dom)
  }
  addLink(anchor){
    this.dom.appendChild(anchor)
  }
  switchpage(id){
    this.currentPage = id;
    this.tabActivate(id)
    this.#pages()
      .filter(e=>e.name!==id)
      .map(e=>e.hide())
    this.pages[id].show()
    this.loadCurrentPage()
    return false
  }
  tabActivate(id){
    [...this.dom.querySelectorAll('a')].map(e=>e.classList.remove('active'))
    this.dom.querySelector(`a[href="#${id}"]`).classList.add('active')
  }
  loadCurrentPage(){
    this.pages[this.currentPage].loadFrames()
  }
  #pages(){
    return Object.keys(this.pages)
      .map(e=>this.pages[e])
  }
  importPages(pages){
    const that = this
    this.currentPage = pages[0].name
    pages.map(p=>{
      const page = new Page(p)
      that.addPage(page)
      p.frames.map(f=>page.addFrame(new Frame(f)))
    })
  }
}
window.onload = async () => {
  const tab = new Tab()
  document.body.appendChild(tab.dom)
  const json = await fetch('pages.json')
  const pages = await json.json()
  tab.importPages(pages)
  tab.switchpage(tab.currentPage)
}
